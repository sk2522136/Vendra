import Organization from '../models/Organization.js';
import ExpressError from "../utils/expressError.js"; 
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getAllPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: '7-Day Free Trial',
        price: 0,
        period: '7 days',
        description: 'Full access to all Vendra features for 7 days.',
        features: [
          'Unlimited Stores/Tenants',
          'Unlimited Products',
          'Real-time Stock & Analytics',
          'Full Feature Access for 7 Days'
        ],
        maxUsers: 100,
        maxProducts: 10000
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        price: 29,
        period: 'month',
        description: 'Full control and unlimited capabilities for growing businesses.',
        features: [
          'Unlimited Stores/Tenants',
          'Unlimited Products & Assets',
          'Real-time Stock & Live Analytics',
          'Automated Secure Backups',
          '24/7 Priority Support'
        ],
        maxUsers: 100,
        maxProducts: 10000,
        stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'Plans retrieved successfully',
      plans
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const planId = req.body.planId || req.body.newPlanId;
    const tenantId = req.tenantId;

    if (!planId) {
      throw new ExpressError("Plan ID required", 400);
    }

    const organization = await Organization.findById(tenantId);
    if (!organization) {
      throw new ExpressError("Organization not found", 404);
    }

    //  7-DAY TRIAL 
    if (planId === 'free') {
      const now = new Date();
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      organization.subscriptionPlan = 'free';
      organization.subscriptionStatus = 'active';
      organization.subscriptionAmount = 0;
      organization.subscriptionStartDate = now;
      organization.subscriptionEndDate = oneWeekLater;
      await organization.save();

      return res.status(200).json({
        success: true,
        message: '1-Week Free Trial activated successfully',
        organization
      });
    }

    // PRO PLAN -> STRIPE CHECKOUT SESSION
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!priceId) {
      throw new ExpressError("STRIPE_PRO_PRICE_ID environment variable missing.", 500);
    }

    let stripeCustomerId = organization.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user?.email || 'customer@vendra.com',
        name: req.user?.name || organization.name,
        metadata: {
          organizationId: tenantId.toString()
        }
      });
      stripeCustomerId = customer.id;
      organization.stripeCustomerId = stripeCustomerId;
      await organization.save();
    }

    //  Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing`,
      metadata: {
        tenantId: tenantId.toString(),
        planId: 'pro'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Checkout session created successfully',
      url: session.url 
    });

  } catch (error) {
    console.error("Stripe Checkout Session Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create checkout session"
    });
  }
};


export const confirmStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const tenantId = req.tenantId;

    

    if (!sessionId) {
      throw new ExpressError("Session ID is required", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const organization = await Organization.findById(tenantId);
      if (!organization) throw new ExpressError("Organization not found", 404);

      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);


      organization.subscriptionPlan = 'pro';
      organization.subscriptionStatus = 'active';
      organization.subscriptionAmount = 29;
      organization.stripeSubscriptionId = session.subscription;
      organization.subscriptionStartDate = now;
      organization.subscriptionEndDate = thirtyDaysLater;
      await organization.save();


      return res.status(200).json({
        success: true,
        message: 'Payment confirmed & Pro plan activated!',
        organization
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful.'
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getSubscriptionStatus = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const organization = await Organization.findById(tenantId);
    if (!organization) {
      throw new ExpressError("Organization not found", 404);
    }

    const now = new Date();
    const isExpired = organization.subscriptionEndDate && new Date(organization.subscriptionEndDate) < now;

    if (organization.subscriptionPlan === 'free' && isExpired) {
      organization.subscriptionStatus = 'expired';
      await organization.save();
    }

    const daysRemaining = organization.subscriptionEndDate 
      ? Math.max(0, Math.ceil((new Date(organization.subscriptionEndDate) - now) / (1000 * 60 * 60 * 24)))
      : 0;

    return res.status(200).json({
      success: true,
      message: 'Subscription status retrieved',
      subscription: {
        plan: organization.subscriptionPlan,
        status: organization.subscriptionStatus,
        amount: organization.subscriptionAmount,
        startDate: organization.subscriptionStartDate,
        endDate: organization.subscriptionEndDate,
        isExpired,
        daysRemaining
      }
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const upgradeSubscription = async (req, res) => {
  try {
    const { newPlanId } = req.body;
    const tenantId = req.tenantId;

    if (newPlanId !== 'pro') {
      throw new ExpressError("Invalid upgrade target plan", 400);
    }

    const organization = await Organization.findById(tenantId);
    if (!organization) {
      throw new ExpressError("Organization not found", 404);
    }

    if (organization.subscriptionPlan === 'pro' && organization.subscriptionStatus === 'active') {
      throw new ExpressError("Already on Pro plan", 400);
    }

    const subscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
    await stripe.subscriptionItems.update(subscription.items.data[0].id, {
      price: process.env.STRIPE_PRO_PRICE_ID
    });

    organization.subscriptionPlan = 'pro';
    organization.subscriptionAmount = 29;
    organization.subscriptionStatus = 'active';
    await organization.save();

    return res.status(200).json({
      success: true,
      message: 'Upgraded to Pro plan successfully',
      organization
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const organization = await Organization.findById(tenantId);
    if (!organization) {
      throw new ExpressError("Organization not found", 404);
    }

    if (organization.stripeSubscriptionId) {
      await stripe.subscriptions.del(organization.stripeSubscriptionId);
    }

    organization.subscriptionStatus = 'cancelled';
    organization.stripeSubscriptionId = null;
    await organization.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      organization
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const tenantId = session.metadata?.tenantId;

    if (tenantId) {
      try {
        const organization = await Organization.findById(tenantId);
        if (organization) {
          const now = new Date();
          const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          organization.subscriptionPlan = 'pro';
          organization.subscriptionStatus = 'active';
          organization.subscriptionAmount = 29;
          organization.stripeSubscriptionId = session.subscription;
          organization.subscriptionStartDate = now;
          organization.subscriptionEndDate = thirtyDaysLater;

          await organization.save();
          console.log(`[Webhook] Pro plan activated successfully for Tenant: ${tenantId}`);
        }
      } catch (dbError) {
        console.error("[Webhook] DB update failed:", dbError);
        return res.status(500).json({ error: "Database update failed" });
      }
    }
  }

  return res.status(200).json({ received: true });
};