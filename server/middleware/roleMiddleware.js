

export const allowRoles = (roles) => (req, res, next) => {
   
    try {
        const { role } = req.user;
        if (roles.includes(role)) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};