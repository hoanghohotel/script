const dateTime = require("node-datetime")

module.exports = {
    findAll:  function(req,data){
        return new Promise(function(resolve, reject) {
            req.getConnection(function(err,connection){
                let sql = 'SELECT * FROM transactions where 1 = 1'
                let condition = []
                
                if(data.gateway_id){
                    condition.push(parseInt(data.gateway_id))
                    sql += " AND gateway_id = ?"
                }
                if(data.gateway_transaction_id){
                    condition.push(data.gateway_transaction_id)
                    sql += " AND gateway_transaction_id = ?"
                }

                if(data.subscription_id){
                    condition.push(parseInt(data.subscription_id))
                    sql += " AND subscription_id = ?"
                }


                sql += " ORDER BY `order` DESC" 
                connection.query(sql,condition,function(err,results,fields)
                {
                    if(err)
                        resolve(false)
                    if(results){
                        const transaction = JSON.parse(JSON.stringify(results));
                        resolve(transaction);
                    }else{
                        resolve(false);
                    }
                })
            })
        });
    },
    getStats: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let condition = []
                let sql = ""
                let type = data.type
                if (data.criteria == "today") {
                    let match = { "00 AM": 0, "01 AM": 0, "02 AM": 0, "03 AM": 0, "04 AM": 0, "05 AM": 0, "06 AM": 0, "07 AM": 0, "08 AM": 0, "09 AM": 0, "10 AM": 0, "11 AM": 0, "12 PM": 0, "01 PM": 0, "02 PM": 0, "03 PM": 0, "04 PM": 0, "05 PM": 0, "06 PM": 0, "07 PM": 0, "08 PM": 0, "09 PM": 0, "10 PM": 0, "11 PM": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('Y-m-d') + ' 00:00:00';
                    var d = new Date();
                    let dd = dateTime.create(d)
                    let nextDate = dd.format('Y-m-d') + " 23:59:00"
                    
                    condition.push(currentDay)
                    condition.push(nextDate)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,(SUM(price) + SUM(admin_commission)) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type =  ?"
                    if(parseInt(data.video_id)){
                        condition.push(parseInt(data.video_id))
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(parseInt(data.user.user_id))
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d %h')"

                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            
                            if (err)
                                resolve(false)
                            const resultArray = {}
                            const spentArray = {}
                            if (results) {

                                let spent = []
                                let result = []

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('I p')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })

                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                        //match[key.toString()] = resultArray[key]
                                    } else {
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('W')})
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_month") {
                    var dt = dateTime.create();
                    var currentYear = dt.format('Y');
                    var currentMonth = dt.format('m');
                    let daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

                    var date = new Date();
                    var firstDay = dateTime.create(new Date(date.getFullYear(), date.getMonth(), 1)).format("Y-m-d") + " 00:00:00";
                    var lastDay = dateTime.create(new Date(date.getFullYear(), date.getMonth() + 1, 0)).format("Y-m-d") + " 23:59:00";

                    let match = ""
                    if (daysInMonth == 31) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0, "31 ": 0 }
                    } else if (daysInMonth == 30) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0 }
                    } else if (daysInMonth == 29) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0}
                    } else if (daysInMonth == 28) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0}
                    }

                    condition.push(firstDay)
                    condition.push(lastDay)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,(SUM(price) + SUM(admin_commission)) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    if(parseInt(data.video_id)){
                        condition.push(parseInt(data.video_id))
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(parseInt(data.user.user_id))
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d')"
                    
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('d')
                                    resultArray[H+" "] = result.count
                                    spentArray[H+" "] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('f') })
                            } else {
                                resolve(false);
                            }
                        })
                    });

                } else if (data.criteria == "this_week") {
                    let match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('W');
                    var weekStart = ""
                    var weekEnd = ""

                    if (currentDay != "Saturday") {
                        var d = new Date();
                        // set to Monday of this week
                        d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                        // set to previous Saturday
                        d.setDate(d.getDate() - 2);
                        weekStart = d
                    } else {
                        weekStart = new Date()
                    }

                    if (currentDay == "Friday") {
                        weekEnd = new Date()
                    } else {
                        var d = new Date();
                        var resultDate = new Date(d.getTime());
                        resultDate.setDate(d.getDate() + (7 + 5 - d.getDay()) % 7);
                        weekEnd = resultDate
                    }
                    var weekStartObj = dateTime.create(weekStart);
                    var weekObj = weekStartObj.format('Y-m-d');
                    var weekEndObj = dateTime.create(weekEnd);
                    var weekendObj = weekEndObj.format('Y-m-d');
                    match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    condition.push(weekObj)
                    condition.push(weekendObj)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,(SUM(price) + SUM(admin_commission)) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    if(parseInt(data.video_id)){
                        condition.push(parseInt(data.video_id))
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(parseInt(data.user.user_id))
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%d')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('W')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:weekObj +" - "+weekendObj })
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_year") {
                    let match = { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
                    var d = new Date();
                    const start = d.getFullYear() + "-01-01 00:00:00"
                    const end = d.getFullYear() + "-12-31 23:59:00"
                    condition.push(start)
                    condition.push(end)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,(SUM(price) + SUM(admin_commission)) as amount,creation_date FROM transactions WHERE  creation_date >= ? AND creation_date <= ? AND (state = 'approved' || state = 'completed') AND type = ? "
                    if(parseInt(data.video_id)){
                        condition.push(parseInt(data.video_id))
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(parseInt(data.user.user_id))
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                reject(err)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('n')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('Y') })
                            } else {
                                resolve("");
                            }
                        })
                    });
                }
            })
        });
    },
    getAdsStats: function (req, data) {
        return new Promise(function (resolve, reject) {
            req.getConnection(function (err, connection) {
                let condition = []
                let sql = ""
                let type = data.type
                if (data.criteria == "today") {
                    let match = { "00 AM": 0, "01 AM": 0, "02 AM": 0, "03 AM": 0, "04 AM": 0, "05 AM": 0, "06 AM": 0, "07 AM": 0, "08 AM": 0, "09 AM": 0, "10 AM": 0, "11 AM": 0, "12 PM": 0, "01 PM": 0, "02 PM": 0, "03 PM": 0, "04 PM": 0, "05 PM": 0, "06 PM": 0, "07 PM": 0, "08 PM": 0, "09 PM": 0, "10 PM": 0, "11 PM": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('Y-m-d') + ' 00:00:00';
                    var d = new Date();
                    let dd = dateTime.create(d)
                    let nextDate = dd.format('Y-m-d') + " 23:59:00"
                    
                    condition.push(currentDay)
                    condition.push(nextDate)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,SUM(amount) as amount,creation_date FROM advertisements_transations WHERE  creation_date >= ? AND creation_date <= ? AND type =  ?"
                    
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d %h')"

                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            
                            if (err)
                                resolve(false)
                            const resultArray = {}
                            const spentArray = {}
                            if (results) {

                                let spent = []
                                let result = []

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('I p')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })

                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                        //match[key.toString()] = resultArray[key]
                                    } else {
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('W')})
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_month") {
                    var dt = dateTime.create();
                    var currentYear = dt.format('Y');
                    var currentMonth = dt.format('m');
                    let daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

                    var date = new Date();
                    var firstDay = dateTime.create(new Date(date.getFullYear(), date.getMonth(), 1)).format("Y-m-d") + " 00:00:00";
                    var lastDay = dateTime.create(new Date(date.getFullYear(), date.getMonth() + 1, 0)).format("Y-m-d") + " 23:59:00";

                    let match = ""
                    if (daysInMonth == 31) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0, "31 ": 0 }
                    } else if (daysInMonth == 30) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0, "30 ": 0 }
                    } else if (daysInMonth == 29) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0, "29 ": 0}
                    } else if (daysInMonth == 28) {
                        match = { "01 ": 0, "02 ": 0, "03 ": 0, "04 ": 0, "05 ": 0, "06 ": 0, "07 ": 0, "08 ": 0, "09 ": 0, "10 ": 0, "11 ": 0, "12 ": 0, "13 ": 0, "14 ": 0, "15 ": 0, "16 ": 0, "17 ": 0, "18 ": 0, "19 ": 0, "20 ": 0, "21 ": 0, "22 ": 0, "23 ": 0, "24 ": 0, "25 ": 0, "26 ": 0, "27 ": 0, "28 ": 0}
                    }

                    condition.push(firstDay)
                    condition.push(lastDay)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,SUM(amount) as amount,creation_date FROM advertisements_transations WHERE  creation_date >= ? AND creation_date <= ? AND type = ? "
                    
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%Y-%m-%d')"
                    
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('d')
                                    resultArray[H+" "] = result.count
                                    spentArray[H+" "] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('f') })
                            } else {
                                resolve(false);
                            }
                        })
                    });

                } else if (data.criteria == "this_week") {
                    let match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    var dt = dateTime.create();
                    var currentDay = dt.format('W');
                    var weekStart = ""
                    var weekEnd = ""

                    if (currentDay != "Saturday") {
                        var d = new Date();
                        // set to Monday of this week
                        d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                        // set to previous Saturday
                        d.setDate(d.getDate() - 2);
                        weekStart = d
                    } else {
                        weekStart = new Date()
                    }

                    if (currentDay == "Friday") {
                        weekEnd = new Date()
                    } else {
                        var d = new Date();
                        var resultDate = new Date(d.getTime());
                        resultDate.setDate(d.getDate() + (7 + 5 - d.getDay()) % 7);
                        weekEnd = resultDate
                    }
                    var weekStartObj = dateTime.create(weekStart);
                    var weekObj = weekStartObj.format('Y-m-d');
                    var weekEndObj = dateTime.create(weekEnd);
                    var weekendObj = weekEndObj.format('Y-m-d');
                    match = { "Saturday": 0, "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
                    condition.push(weekObj)
                    condition.push(weekendObj)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,SUM(amount) as amount,creation_date FROM advertisements_transations WHERE  creation_date >= ? AND creation_date <= ? AND type = ? "
                    if(parseInt(data.video_id)){
                        condition.push(parseInt(data.video_id))
                        sql += " AND id = ?"
                    }
                    if(data.user){
                        condition.push(parseInt(data.user.user_id))
                        sql += " AND owner_id = ?"
                    }
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%d')"
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                resolve(false)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}

                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('W')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:weekObj +" - "+weekendObj })
                            } else {
                                resolve(false);
                            }
                        })
                    });
                } else if (data.criteria == "this_year") {
                    let match = { "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0 }
                    var d = new Date();
                    const start = d.getFullYear() + "-01-01 00:00:00"
                    const end = d.getFullYear() + "-12-31 23:59:00"
                    condition.push(start)
                    condition.push(end)
                    condition.push(type)
                    sql += "SELECT COUNT(*) as count,SUM(amount) as amount,creation_date FROM advertisements_transations WHERE  creation_date >= ? AND creation_date <= ? AND type = ? "
                    
                    sql += " GROUP BY DATE_FORMAT(creation_date,'%m')"
                    
                    req.getConnection(function (err, connection) {
                        connection.query(sql, condition, function (err, results, fields) {
                            if (err)
                                reject(err)
                            if (results) {
                                let spent = []
                                let result = []
                                const resultArray = {}
                                const spentArray = {}
                                Object.keys(results).forEach(function (key) {
                                    let result = JSON.parse(JSON.stringify(results[key]))
                                    const H = dateTime.create(result.creation_date).format('n')
                                    resultArray[H] = result.count
                                    spentArray[H] = result.amount
                                })
                                Object.keys(match).forEach(function (key) {
                                    if (resultArray[key]) {
                                        result.push(resultArray[key])
                                        spent.push(spentArray[key])
                                    }else{
                                        result.push(0)
                                        spent.push(0)
                                    }
                                });
                                resolve({ spent: spent, result: result, xaxis: Object.keys(match),yaxis:dateTime.create(new Date()).format('Y') })
                            } else {
                                resolve("");
                            }
                        })
                    });
                }
            })
        });
    }
}
