
export const filterProducts = (req) => {
   
        let filter = {isActive : true};
        if(req.query.category){
            filter.category = req.query.category
        }
         if(req.query.supplier){
            filter.supplier = req.query.supplier
        }

        if(req.query.search){
            filter.name = {$regex : req.query.search , $options : 'i'}
            }
            
        return filter;
} 


export const getPaginatedProducts =  (req  ) => {
   
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        return { limit , skip }
} 
    

export const getSortProducts =  (req ) => {
    
        const sortBy = req.query.sortBy || 'createdAt';
        const sortorder = req.query.order === 'Asc' ? 1 : -1;
        return {sortBy , sortorder}
       
}

export default {filterProducts , getPaginatedProducts , getSortProducts};