// const Razorpay = require('razorpay'); 
// const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// const razorpayInstance = new Razorpay({
//     key_id: RAZORPAY_ID_KEY,
//     key_secret: RAZORPAY_SECRET_KEY
// });


// const renderProductPage = async(req, res) => {
//     try{
//         res.render('product');
//     }catch(error){
//         console.log(error.message);
//     }
// }

// const createOrder = async(req, res)=>{
//     try{
//         const amount = req.body.amount*100
//         const options = {
//             amount: amount,
//             currency: 'INR',
//             receipt: 'balunandam1122@gmail.com'
//         }

//     instance.orders.create(options, (err, order) => {
//         if(!err){
//             res.status(200).send({
//                 success: true,
//                 msg: 'Payment ok',
//                 order_id: order.id,
//                 amount: amount,
//                 key_id: RAZORPAY_ID_KEY,
//                 product_name:req.body.name,
//                 description:req.body.description,
//                 contact:"9493991327",
//                 name: "balu",
//                 email: "balunandam1122@gmail.com"
//             });
//         }
//         else{
//             res.status(400).send({success:false,msg:'Something went wrong!'});
//         }
//         });
//     }catch (error){
//         console.log(error.message);
//     }
// }

// payment_route.get('/', paymentController.renderProductPage);
// payment_route.post('/createOrder', paymentController.createOrder);

// module.exports = {
//     renderProductPage,
//     createOrder
// }