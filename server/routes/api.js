const express = require('express');
const router = express.Router();
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Q = require('q');
var config = require('../../config.json');
var mongodb = require("mongodb");

var db;

mongodb.MongoClient.connect(config.connectionString, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
  
});

var COUNTS_COLLECTION = "counts";
var USERS_COLLECTION = "users";
var BILLS_COLLECTION = "bills";
var PRODUCTS_COLLECTION = "products";
var COMPANY_COLLECTION = "company";
var COUNTERREPORT_COLLECTION = "counterReport";
var ACTIVITY_COLLECTION = "activity";
var CUSTOMERS_COLLECTION = "customers";

router.post('/register', register);
router.post('/authenticate', authenticate);
router.post('/updateUserDetails', updateUserDetails);
router.get('/getProducts', getProducts);
router.post('/saveProducts', saveProducts);
router.post('/saveBill', saveBill);
router.get('/getTodayAllBill', getTodayAllBill);
router.get('/getBillCounter', getBillCounter);
router.post('/saveCompany', saveCompany);
router.get('/getBillById/:billId', getBillById);
router.get('/getCompanies', getCompanies);
router.post('/closeCounter', closeCounter);
router.get('/getAllCounterDetails', getAllCounterDetails);
router.get('/getRecentActivities', getRecentActivities);
router.post('/createCutomer', createCutomer);
router.get('/getAllCustomers', getAllCustomers);
router.get('/getCustomersById/:customerId', getCustomersById);
router.post('/clearCreditAmount', clearCreditAmount);
router.get('/getRecentActivitiesByType/:type', getRecentActivitiesByType);
router.post('/getAllCounterDetailsByRange', getAllCounterDetailsByRange);

var currentUser;
function register(req, res) {
    
  db.collection(USERS_COLLECTION).findOne({username : req.body.username}, function(error, user){
    if(error) res.send({message:"Database Problem.",status: 500});

    if(user){
      res.send({message: 'Username ' + req.body.username + ' is already taken',status:500});
    }
    else{
      var user = _.omit(req.body, 'password');
      user.hash = bcrypt.hashSync(req.body.password, 10);
      db.collection(USERS_COLLECTION).insert(user,function(error, user){
        if(error) res.send({message:"Database Problem.",status: 500});
        
        res.send({message : "User registered successfully.",status:200});
      });
    }
  });
}

function authenticate(req, res){
  
  var deferred = Q.defer();
  
      db.collection(USERS_COLLECTION).findOne({ username: req.body.username }, function (err, user) {
          if (err) res.send({message:"Database Problem.",status: 500});
  
          if (user && bcrypt.compareSync( req.body.password, user.hash)) {
              currentUser = user.firstName + " "+ user.lastName;
              // authentication successful
              res.send({message: "User Authenticated successfully.",currentUser: user ,status:200 ,token: 'fake-jwt-token' });
          } else {
              // authentication failed
              res.send({message: "Error: Username or password is incorrect",status:500});
          }
      });
}

function updateUserDetails(req, res){
  db.collection(USERS_COLLECTION).update({ username: req.body.username}, { $set:{firstName: req.body.firstName, lastName: req.body.lastName, mobile: req.body.mobile}},function(err, user){
    if(err) {
      res.send({message:"Database Problem.",status: 500});
    }  
    else {
      db.collection(USERS_COLLECTION).findOne({ username: req.body.username }, function (err, user) {
        if (err) res.send({message:"Database Problem.",status: 500});

        if (user) {
            var activity = {
              message: req.body.firstName + " "+ req.body.lastName + " updated his profile.",
              action: "UPDATE",
              dateTime: new Date(),
              type: "PROFILE",
              author : currentUser
            }
            insertActivity(activity);
            res.send({message: "User Details updated successfully.",currentUser: user ,status:200});
        } else {
            res.send({message: "Error: Username or password is incorrect",status:500});
        }
      });
    }; 
  });
};

function getProducts(req, res){
  
  db.collection(PRODUCTS_COLLECTION).find().sort({companyName: 1, productName: 1}).toArray(function(error,products){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({products: products,status: 200});

  });
}

function saveProducts(req, res){
  var counter = 0;
  db.collection(COUNTS_COLLECTION).findOne({counterId: "ProductCounter"},function(error, counter){
    if(error) res.send({message:"Database Problem.",status: 500});

    if(counter){
      counter = counter.count;
      
      for(var i=0; i<req.body.save.length; i++){
        var product = req.body.save[i];
        
        product.productId = counter;
        db.collection(PRODUCTS_COLLECTION).insert(product);
        var activity = {
          message: req.body.save[i].productName + " product of "+ req.body.save[i].companyName+ " company added in stock.",
          action: "INSERT",
          dateTime: new Date(),
          type: "PRODUCT",
          author : currentUser
        }
        insertActivity(activity);
        counter++; 
      }
      
      db.collection(COUNTS_COLLECTION).update({counterId: "ProductCounter"}, { $set:{count: counter}});
    }
  });
  
  

  for(var i=0; i<req.body.update.length; i++){
    var product = req.body.update[i];
    db.collection(PRODUCTS_COLLECTION).update({ productId: product.productId }, { $set:{quantity: product.quantity, buyPrice: product.buyPrice }},function(err, doc){
      if(err) res.send({message:"Database Problem.",status: 500});

      var activity = {
        message: product.productName + " product of "+ product.companyName+ " company's qauntity updated to "+ product.quantity+ " in stock.",
        action: "UPDATE",
        dateTime: new Date(),
        type: "PRODUCT",
        author : currentUser
      }
      insertActivity(activity);
    });
  }
  res.send({message : "Products saved successfully.",status:200});
}


function saveBill(req, res){
  
  db.collection(BILLS_COLLECTION).insert(req.body,function(error, doc){
    if(error){
      res.send({message:"Database Problem.",status: 500});
    } 
    else{
        var count = req.body.billId + 1;
        db.collection(COUNTS_COLLECTION).update({counterId: "BillCounter"}, { $set:{count: count}},function (erro,doc){
          if(error) res.send({message:"Database Problem.",status: 500});
        });
        
        db.collection(CUSTOMERS_COLLECTION).findOne({customerId: req.body.customerId},function(error, customer){
          if(error) res.send({message:"Database Problem.",status: 500});

          if(customer){
            customer.amountCredit += req.body.amountCredit;
            customer.amountPaid += req.body.amountPaid;
            customer.totalAmount += req.body.totalAmount;
            var billDetails = {
              billDate : req.body.billDate,
              paid: req.body.amountPaid,
              credit : req.body.amountCredit,
              amount : req.body.totalAmount,
              billId: req.body.billId
            }
            customer.transactionHistory.push(billDetails);
            db.collection(CUSTOMERS_COLLECTION).update({customerId : req.body.customerId},{ $set: {amountCredit: customer.amountCredit, 
              amountPaid: customer.amountPaid, totalAmount: customer.totalAmount, transactionHistory: customer.transactionHistory}});
          }
        });
      res.send({message : "Bill saved successfully.",status:200});
    }
  });
}


function getTodayAllBill(req, res){
  var todayDate = formatDate(new Date());
  db.collection(BILLS_COLLECTION).find({billDate: todayDate}).toArray(function(error,bills){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({bills: bills,status: 200});

  });
  
}


function getBillCounter(req, res){
  db.collection(COUNTS_COLLECTION).findOne({counterId: "BillCounter"},function(error, counter){
    if(error) res.send({message:"Database Problem.",status: 500});
    
    res.send({counter : counter.count ,status:200});
  });
}

function getBillById(req,res){
  var id = parseInt(req.params.billId);
  db.collection(BILLS_COLLECTION).findOne({'billId': id}, function(error, bill){
    if(error) res.send({message:"Database Problem.",status: 500});

    res.send({bill: bill, status: 200});
  })
}

function saveCompany(req, res){
  
    db.collection(COUNTS_COLLECTION).findOne({counterId: "CompanyCounter"},function(error, counter){
      if(error) res.send({message:"Database Problem.",status: 500});
  
      if(counter){
        db.collection(COMPANY_COLLECTION).findOne({companyName: req.body.companyName},function(error,company){
          if(company){
            res.send({message: "Company has been already saved.", status:500});
          }
          else{
            req.body.companyId = counter.count;
            db.collection(COMPANY_COLLECTION).insert(req.body,function(error,doc){
              if(error) res.send({message:"Database Problem.",status: 500});
              
              var activity = {
                message: req.body.companyName+ " company saved in application.",
                action: "INSERT",
                dateTime: new Date(),
                type: "COMPANY",
                author : currentUser
              }
              insertActivity(activity);
              res.send({message: "Company registered successfully.", status: 200});
            });
            counter.count++;
            db.collection(COUNTS_COLLECTION).update({counterId: "CompanyCounter"}, { $set:{count: counter.count}},function (erro,doc){
              if(error) res.send({message:"Database Problem.",status: 500});
            });
          }
        });
      }
  
    });
  }

function getCompanies(req, res){
  db.collection(COMPANY_COLLECTION).find().sort({companyName : 1}).toArray(function(error,companies){
      if (error) res.send({message:"Database Problem.",status: 500});
      
      res.send({companies: companies,status: 200});
  });
  
}

function closeCounter(req, res){
  db.collection(COUNTERREPORT_COLLECTION).findOne({counterDate: req.body.counterDate}, function(error, report){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    if(report){
      db.collection(COUNTERREPORT_COLLECTION).update({counterDate: req.body.counterDate}, { $set: {pesticideProfit: req.body.pesticideProfit, fertilizerProfit : req.body.fertilizerProfit,
         totalProfit: req.body.totalProfit, pesticideBussiness : req.body.pesticideBussiness, fertilizerBussiness : req.body.fertilizerBussiness, totalBussiness: req.body.totalBussiness,
         createdDate: req.body.createdDate, closedBy : req.body.closedBy}}); 
         var activity = {
          message: "Counter Updated for date "+ req.body.counterDate +".",
          action: "UPDATE",
          dateTime: new Date(),
          type: "COUNTERREPORT",
          author : currentUser
        }
        insertActivity(activity);
      res.send({message: "Today's Counter reports updated successfully.", status: 200});
    }
    else{
      db.collection(COUNTERREPORT_COLLECTION).insert(req.body);
      var activity = {
        message: "Counter Closed "+ req.body.counterDate +".",
        action: "INSERT",
        dateTime: new Date(),
        type: "COUNTERREPORT",
        author : currentUser
      }
      insertActivity(activity);
      res.send({message: "Today's Counter reports saved successfully.", status: 200});
    }
  });
}

function getAllCounterDetails(req,res){
  db.collection(COUNTERREPORT_COLLECTION).find().sort({createdDate : 1}).toArray(function(error,counterDetails){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({counterDetails: counterDetails,status: 200});
  });
}

function getRecentActivities(req,res){
  db.collection(ACTIVITY_COLLECTION).find({}, {limit: 30}).sort({dateTime : -1}).toArray(function(error,activities){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({activities: activities,status: 200});
  });
}

function createCutomer(req, res){
  db.collection(COUNTS_COLLECTION).findOne({counterId: "CustomerCounter"},function(error, counter){
    if(error) res.send({message:"Database Problem.",status: 500});

    if(counter){
      db.collection(CUSTOMERS_COLLECTION).findOne({customerName: req.body.customerName},function(error,customer){
        if(customer){
          res.send({message: "Customer has been already saved.", status:500});
        }
        else{
          req.body.customerId = "CUST-"+counter.count;
          db.collection(CUSTOMERS_COLLECTION).insert(req.body,function(error,doc){
            if(error) res.send({message:"Database Problem.",status: 500});
            
            res.send({message: "Customer registered successfully with Customer Id "+ req.body.customerId, status: 200});
          });
          counter.count++;
          db.collection(COUNTS_COLLECTION).update({counterId: "CustomerCounter"}, { $set:{count: counter.count}},function (erro,doc){
            if(error) res.send({message:"Database Problem.",status: 500});
          });
        }
      });
    }

  });
}

function getAllCustomers(req, res){
  db.collection(CUSTOMERS_COLLECTION).find().sort({customerName : 1}).toArray(function(error,customers){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({customers: customers,status: 200});
  });
}

function getCustomersById(req,res){
  db.collection(CUSTOMERS_COLLECTION).findOne({'customerId': req.params.customerId}, function(error, customer){
    if(error) res.send({message:"Database Problem.",status: 500});
    
    res.send({customer: customer, status: 200});
  })
}

function clearCreditAmount(req,res){

  db.collection(BILLS_COLLECTION).findOne({billId : req.body.billId}, function(error, bill){
    if(error) res.send({message:"Database Problem.",status: 500});

    if(bill){
      bill.amountCredit = bill.amountCredit - req.body.creditAmount;
      bill.amountPaid += req.body.creditAmount;

      db.collection(BILLS_COLLECTION).update({billId : req.body.billId},{ $set:{amountCredit: bill.amountCredit, amountPaid : bill.amountPaid }});

      db.collection(CUSTOMERS_COLLECTION).findOne({customerId : req.body.customerId}, function(error, customer){
        if(error) res.send({message:"Database Problem.",status: 500});

        if(customer){
          customer.amountCredit = customer.amountCredit - req.body.creditAmount;
          customer.amountPaid += req.body.creditAmount;
          for(var i=0; i< customer.transactionHistory.length; i++){
              if(customer.transactionHistory[i].billId === req.body.billId){
                customer.transactionHistory[i].credit = customer.transactionHistory[i].credit - req.body.creditAmount;
                customer.transactionHistory[i].paid += req.body.creditAmount;
              }
          }
          db.collection(CUSTOMERS_COLLECTION).update({customerId : req.body.customerId},{ $set: {amountCredit : customer.amountCredit,
            amountPaid: customer.amountPaid, transactionHistory : customer.transactionHistory}});
        }
      });
    }
    res.send({message:"Customer Details updated successfully.",status: 200});
  });
}

function getRecentActivitiesByType(req,res){
  
  db.collection(ACTIVITY_COLLECTION).find({type: req.params.type}, {limit: 30}).sort({dateTime : -1}).toArray(function(error,activities){
    if (error) res.send({message:"Database Problem.",status: 500});
    
    res.send({activities: activities,status: 200});
  });
}

function getAllCounterDetailsByRange(req, res){
  var data = [];
  db.collection(COUNTERREPORT_COLLECTION).find().sort({createdDate : 1}).toArray(function(error,counterDetails){
    if (error) res.send({message:"Database Problem.",status: 500});

    if(counterDetails){
      for(var i = 0; i< counterDetails.length; i++) {
        if(counterDetails[i].createdDate >= req.body.startDate && counterDetails[i].createdDate <= req.body.endDate){
          data.push(counterDetails[i]);
        };
      }
      res.send({counterDetails: data,status: 200});
    }
    
  });
}

function insertActivity(activity){
  db.collection(ACTIVITY_COLLECTION).insert(activity);
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}


module.exports = router;
