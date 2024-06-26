const commonFunction = require("../functions/commonFunctions")
const categoryModel = require("../models/categories")
const blogModel = require("../models/blogs")
const privacyModel = require("../models/privacy")
const userModel = require("../models/users")
const likeModel = require("../models/likes")
const favouriteModel = require("../models/favourites")
const readingTime = require("reading-time")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const privacyLevelModel = require("../models/levelPermissions")
const globalModel = require("../models/globalModel")

exports.browse = async(req,res) => {
    const queryString = req.query
    await commonFunction.getGeneralInfo(req,res,'blog_browse')

    const limit = 21
    const data = {limit:limit}
    req.query.search = {}
    data['type'] = queryString.type
    if(queryString.q && !queryString.tag){
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }
    if(queryString.tag){
        req.query.search.tag = queryString.tag
        req.query.search.q = queryString.tag
        data['tags'] = queryString.tag
    }
    if(queryString.category_id){
        data['category_id'] = queryString.category_id
        req.query.search.category_id = queryString.category_id
    }
    if(queryString.subcategory_id){
        data['subcategory_id'] = queryString.subcategory_id
        queryString.category_id = queryString.subcategory_id
        req.query.search.subcategory_id = queryString.subcategory_id
    }
     if(queryString.subsubcategory_id){
        data['subsubcategory_id'] = queryString.subsubcategory_id
        queryString.category_id = queryString.subsubcategory_id
        req.query.search.subsubcategory_id = queryString.subsubcategory_id
    }

    if(queryString.sort == "latest"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.blog_id desc"
    }else if(queryString.sort == "favourite" && req.appSettings['blog_favourite'] == 1){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.favourite_count desc"
    }else if(queryString.sort == "view"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.view_count desc"
    }else if(queryString.sort == "like" && req.appSettings['blog_like'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.like_count desc"
    }else if(queryString.sort == "dislike" && req.appSettings['blog_dislike'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.dislike_count desc"
    }else if(queryString.sort == "rated" && req.appSettings['blog_rating'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.rating desc"
    }else if(queryString.sort == "commented" && req.appSettings['blog_comment'] == "1"){
        req.query.search.sort = queryString.sort
        data['orderby'] = "blogs.comment_count desc"
    }
    
    if(queryString.type == "featured" && req.appSettings['blog_featured'] == 1){
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    }else if(queryString.type == "sponsored" && req.appSettings['blog_sponsored'] == 1){
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    }else if(queryString.type == "hot" && req.appSettings['blog_hot'] == 1){
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }
    
    //get all blogs as per categories
    await blogModel.getBlogs(req,data).then(result => {
        if(result){
            req.query.pagging = false
            let items = result
            if(result.length > limit - 1){
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.blogs = items
        }
    })
    //get categories
    const categories = []
    await categoryModel.findAll(req,{type:"blog"}).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0){
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if(categories.length > 0)
        req.query.categories = categories

    return res.send({...req.query,page_type:"blogs"});
    
}
exports.categories = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'browse_blog_category_view')
    req.query.type = "blog"
    let category = {}
    await categoryModel.findAll(req,{getCount:1, type: req.query.type,orderBy:" categories.item_count DESC " }).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})

    const limit = 10
    const data = { limit: limit,orderby:" blogs.view_count DESC" }

    await blogModel.getBlogs(req, data).then(result => {
        if (result) {
            let items = result
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"categories"});
    
}
exports.category = async(req,res) => {
    const url = req.params.id
    await commonFunction.getGeneralInfo(req,res,'blog_category_view')

    req.query.id = req.params.id
    req.query.type = "blog"
    let category = {}
    await categoryModel.findByCustomUrl({id:req.query.id,type:req.query.type},req,res).then(result => {
        if(result)
            category = result
    }).catch(error => {
        return res.send({...req.query,pagenotfound:1});
    })
    
    if(!Object.keys(category).length){
        return res.send({...req.query,pagenotfound:1});
    }
    req.query.category = category
    if(category.subcategory_id == 0 && category.subsubcategory_id == 0){
        await categoryModel.findAll(req,{type:"blog",subcategory_id:category.category_id}).then(result => {
            if(result){
                req.query.subcategories = result
            }
        });
    }else if(category.subcategory_id > 0){
        await categoryModel.findAll(req,{type:"blog",subsubcategory_id:category.category_id}).then(result => {
            if(result){
                req.query.subsubcategories = result
            }
        });
    }
    const limit = 21
    const data = {limit:limit}
    if(category.subcategory_id == 0 && category.subsubcategory_id == 0){
        data['category_id'] = category.category_id
    }else if(category.subcategory_id > 0){
        data['subcategory_id'] = category.category_id
    }else if(category.subsubcategory_id > 0){
        data['subsubcategory_id'] = category.category_id
    }

    
    
    //get all blogs as per categories
    await blogModel.getBlogs(req,data).then(result => {
        if(result){
            req.query.pagging = false
            let items = result
            if(result.length > limit - 1){
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"category"});
    
}
exports.view = async (req,res) => {
    await commonFunction.getGeneralInfo(req,res,'blog_view')

    req.query.id = req.params.id

    let blog = {}


    await blogModel.findByCustomUrl(req.query.id,req,res).then(result => {
        if(result)
            blog = result
    }).catch(error => {
        return res.send({...req.query,pagenotfound:1});
    })
    
    let showBlog = true
    if(Object.keys(blog).length){
        await privacyModel.check(req,blog,'blog').then(result => {
            showBlog = result
            
        }).catch(error => {
             showBlog = false
        })
    }

    if(!Object.keys(blog).length || !showBlog || (blog.approve != 1 && (!req.user || blog.owner_id != req.user.user_id && req.levelPermissions['blog.view'] != 2))){
        return res.send({...req.query,pagenotfound:1});
    }
    await commonFunction.updateMetaData(req,{title:blog.title,description:blog.description,image:blog.image,keywords:blog.tags})

    //blog user details
    await userModel.findById(blog.owner_id,req,res).then(result => {
        blog.owner = result
    }).catch(error => {

    })

    if(!blog.owner){
        return res.send({...req.query,pagenotfound:1});
    }
    
    let level_id = blog.owner ? blog.owner.level_id : 0

    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        let isPermissionAllowed = false
        if(req.user && (req.user.user_id == blog.owner_id || (req.levelPermissions["blogs.view"] && req.levelPermissions["blogs.view"].toString() == "2"))){
            isPermissionAllowed = true;
        }
        if(blog.view_privacy.indexOf("package_") > -1 && !isPermissionAllowed){
            let owner_id = req.user ? req.user.user_id : 0
            let checkPlanSql = ""
            let conditionPlanSql = [owner_id,blog.blog_id]
            checkPlanSql += 'SELECT `member_plans`.price as `package_price`,`subscriptions`.package_id as loggedin_package_id,mp.price as loggedin_price,'
            checkPlanSql+=  ' CASE WHEN member_plans.price IS NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
            checkPlanSql+=  ' WHEN  `member_plans`.price > mp.price THEN 2'
            checkPlanSql += ' ELSE 0 END as is_active_package'
            checkPlanSql += ' FROM `blogs` LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`blogs`.view_privacy,"package_","") LEFT JOIN'
            checkPlanSql += ' `subscriptions` ON subscriptions.id = blogs.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id WHERE '
            checkPlanSql += ' blogs.blog_id = ? LIMIT 1'
            await globalModel.custom(req,checkPlanSql,conditionPlanSql).then(result => {
                if(result && result.length > 0){
                    const res = JSON.parse(JSON.stringify(result))[0];
                    if(res.is_active_package == 0){
                        res.type = "new"
                        req.query.needSubscription = res; 
                    }else if(res.is_active_package == 2){
                        res.type = "upgrade"
                        req.query.needSubscription = res;
                    }
                }
            })
        }
    }

    if(req.query.needSubscription){
        //get user plans
        await userModel.getPlans(req, { owner_id: blog.owner.user_id, item:req.query.needSubscription }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }

    //like
    await likeModel.isLiked(blog.blog_id,'blogs',req,res).then(result => {
        if(result){
            blog.like_dislike = result.like_dislike
        }
    })

    if(blog.favourite_count){
        //favourite
        await favouriteModel.isFavourite(blog.blog_id,'blogs',req,res).then(result => {
            if(result){
                blog['favourite_id'] = result.favourite_id
            }
        })
    }
    
    blog.readingTime = readingTime(blog.description)
    
    //category details
    if(blog.category_id){
        await categoryModel.findById(blog.category_id,req,res).then(result => {
            if(result){
                blog.category = result
            }
        })
        if(blog.subcategory_id){
            await categoryModel.findById(blog.subcategory_id,req,res).then(result => {
                if(result){
                    blog.subcategory = result
                }
            }) 
            if(blog.subsubcategory_id){
                await categoryModel.findById(blog.subsubcategory_id,req,res).then(result => {
                    if(result){
                        blog.subsubcategory = result
                    }
                })
            }
        }
    }

    //related blogs category || tags
    await blogModel.getBlogs(req,{category_id:blog.category_id,tags:blog.tags,not_blog_id:blog.blog_id,'related':true,limit:12}).then(result => {
        if(result){ 
            req.query.relatedBlogs = result
        }
    })
    await privacyModel.permission(req, 'blog', 'delete', blog).then(result => {
        blog.canDelete = result
    }).catch(err => {

    })
    await privacyModel.permission(req, 'blog', 'edit', blog).then(result => {
        blog.canEdit = result
    }).catch(err => {

    })
    if(!req.query.needSubscription)
        blog['description'] = commonFunction.censorWords(req,blog.description)
    else
        delete blog['description'];
    if (req.appSettings['blog_adult'] != 1 || (blog.adult == 0 || (blog.adult == 1 && req.query.adultAllowed))) {
        req.query.blog = blog        
        if(blog.approve == 1)
            recentlyViewed.insert(req,{id:blog.blog_id,owner_id:blog.owner_id,type:'blogs',creation_date:dateTime.create().format("Y-m-d H:M:S")})
    }else{
        req.query.adultBlog = blog.adult
    }
    return res.send({...req.query,page_type:"blog"});
    
}
exports.create = async (req,res) => {    
    let blogType = "blog_create"

    let isValid = true
    const id = req.params.id
    if (id) {
        blogType = "blog_edit"
        await blogModel.findByCustomUrl(id, req, res,true).then(async blog => {
            req.query.editItem = blog
            req.query.id = id
            await privacyModel.permission(req, 'blog', 'edit', blog).then(result => {
                isValid = result
            }).catch(err => {
                isValid = false
            })
        }).catch(err => {
            isValid = false
        })
    }
    req.fromBlog = true
    await commonFunction.getGeneralInfo(req, res, blogType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
   
    //get categories
    const categories = []
    await categoryModel.findAll(req,{type:"blog"}).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0){
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if(categories.length > 0)
        req.query.blogCategories = categories

     //owner plans
     await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',req.user ? req.user.level_id : 0).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        //get user plans
        await userModel.getPlans(req, { owner_id: req.user ? req.user.user_id : 0 }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }
    return res.send({...req.query,page_type:"create-blog"});
    
}