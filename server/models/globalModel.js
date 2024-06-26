module.exports = {
    custom: function(req,query,data = []){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query(query,data,function(err,results,fields)
                {
                    
                    if(err){
                        console.log(err,'custom');
                        resolve(false)
                    }
                        
                    if(results){
                        resolve(results) 
                    }else{
                        resolve(false)
                    }
                })
            })
        })
    },
    create: function(req,data,tablename){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                if(process.env.NODE_ENV !== 'production'){
                    console.log(data,tablename)
                }
                connection.query('INSERT IGNORE INTO '+tablename+' SET ?',data,function(err,results,fields)
                {
                    
                    if(err){
                        console.log(err,'insert')
                        resolve(false)
                    }
                       
                    if(results){
                        resolve(results) 
                    }else{
                        resolve(false)
                    }
                })
            })
        })
    },
    delete: function(req,tablename,PrimaryKey,where){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                connection.query('DELETE FROM '+tablename+' WHERE '+PrimaryKey+" = ?",[where],function(err,results,fields)
                {
                    
                    if(err){
                        console.log(err,'delete')
                        resolve(false)
                    }
                        
                    if(results){
                        resolve(results) 
                    }else{
                        resolve(true)
                    }
                })
            })
        })
    },
    update: function(req,data,tablename,PrimaryKey,where){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                if(process.env.NODE_ENV !== 'production'){
                    console.log(data,tablename)
                }
                connection.query('UPDATE '+tablename+' SET ? WHERE '+PrimaryKey+" = ?",[data,where],function(err,results,fields)
                {
                        
                    if(err){
                        console.log(err,'update')
                        resolve(false)
                    }
                        
                    if(results){
                        resolve(results) 
                    }else{
                        resolve(true)
                    }
                })
            })
        })
    },
    
}
