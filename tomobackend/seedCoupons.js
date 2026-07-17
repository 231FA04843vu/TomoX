const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  await Coupon.deleteMany({});
  
  const coupons = [
    {
      code: 'PAYTMUPI',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 100,
      title: 'Flat ₹50 cashback with Paytm UPI',
      description: 'Flat ₹50 cashback using Paytm UPI on payments above ₹100',
      termsAndConditions: [
        'Cashback offer exclusive to users inactive on Paytm for more than 60 days',
        'Flat ₹50 cashback if no Paytm payment has been made anywhere in the last 60 days; otherwise, get a ₹50 recharge/bill payment coupon',
        'To avail the offer, the user must complete a payment on the merchant app/website using Paytm UPI or Paytm UPI Lite',
        'Users will receive cashback via scratch cards in the “Cashback & Offers” section of the Paytm app. These scratch cards expire 2 days after issuance',
        'After scratching, cashback will be credited to the user’s UPI-linked bank account within 24 hours',
        'Users who have used Paytm anywhere in the last 60 days will receive a ₹50 voucher, valid for 7 days and redeemable on subsequent recharge or bill payments on the Paytm app',
        'User will get a flat ₹50 instant discount upon applying the unique voucher code in the “Offers for you” section',
        'User will receive cashback or voucher only once, applicable on either Food or Instamart or Dineout payment whichever is first',
        'Paytm may update or discontinue the offer or its Terms & Conditions from time to time. Any changes may be made without prior notice',
        'For any offer-related queries, users may contact Paytm Customer Support',
        'Other standard Terms & Conditions apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'hot'
    },
    {
      code: 'AMAZONPAYLATER',
      discountType: 'fixed',
      discountValue: 25,
      minOrderAmount: 199,
      title: 'Flat ₹25 cashback with Amazon Pay Later',
      description: 'Flat ₹25 cashback on Amazon Pay Later transactions above ₹199',
      termsAndConditions: [
        'Applicable once per user during the offer period',
        'Flat ₹25 cashback will be available in the form of a scratch card in your Amazon Pay account',
        'Valid on the net transaction amount of ₹199 & above using Amazon Pay Later',
        'Valid only for users who have linked their Amazon account and paid using Amazon Pay Later',
        'Not valid on payments via Amazon Pay UPI directly from the UPI section or Amazon Pay Balance',
        'The cashback will only be issued once the customer scratches the issued card by going to the Rewards page on Amazon Pay',
        'Once the scratched card is scratched, cashback will be credited as Amazon Pay Balance within 24 hours',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'standard'
    },
    {
      code: 'APAYFEST',
      discountType: 'fixed', // Modified to fixed since description says Flat ₹15
      discountValue: 15,
      minOrderAmount: 199,
      title: 'Flat ₹15 cashback with Amazon Pay Balance',
      description: 'Flat ₹15 cashback on Amazon Pay Balance transactions above ₹199',
      termsAndConditions: [
        'Applicable once per user during the offer period',
        'Flat ₹15 cashback will be available in the form of a scratch card in your Amazon Pay account',
        'Valid on the net transaction amount of ₹199 & above using Amazon Pay Balance',
        'Valid only for users who have linked their Amazon account and paid using Amazon Pay Balance',
        'Not valid on payments via Amazon Pay UPI directly from the UPI section or Amazon Pay balance',
        'The cashback will only be issued once the customer scratches the issued card by going to the Rewards page on Amazon Pay',
        'Once the scratched card is scratched, cashback will be credited as Amazon Pay Balance within 24 hours',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'standard'
    },
    {
      code: 'MBKKICK',
      discountType: 'fixed',
      discountValue: 150, // "Up to 150"
      minOrderAmount: 249,
      title: 'Up to ₹150 cashback with MobiKwik Wallet',
      description: 'Assured ₹10 to ₹150 Instant Cashback via Scratch Card on MobiKwik Wallet transactions above ₹249',
      termsAndConditions: [
        'Assured cashback will be ₹10 per transaction',
        'Applicable once per user across Food & Toing payments per calendar month',
        'Valid on the net transaction amount of ₹249 & above using the MobiKwik Wallet',
        'Cashback can be claimed through a Scratch card on the MobiKwik app in the rewards section & the Scratch card will be valid for 7 days only',
        'Cashback will be credited to the user\'s MobiKwik wallet after the scratch card is scratched',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'standard'
    },
    {
      code: 'FLAT175',
      discountType: 'fixed',
      discountValue: 175,
      minOrderAmount: 599,
      title: 'Get Flat Rs.175 off',
      description: 'Use code FLAT175 & get flat ₹175 off on orders above 599.',
      termsAndConditions: [
        'Offer is valid only on select restaurants',
        'Coupon code can be applied only once in 2 hrs on this restaurant',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-10-31T23:59:59'),
      couponType: 'mega'
    },
    {
      code: 'NEWYEARPARTY',
      discountType: 'fixed',
      discountValue: 300,
      minOrderAmount: 1399,
      title: 'Get Flat ₹300 off',
      description: 'Use code NEWYEARPARTY & get FLAT ₹300 Off on orders above ₹1399',
      termsAndConditions: [
        'Offer is valid only on select restaurants',
        'Coupon code can be applied only once in 2 hrs on this restaurant',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'mega'
    },
    {
      code: 'FLAT500',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 1999,
      title: 'Get Flat Rs.500 Off',
      description: 'Use code FLAT500 & get Flat ₹500 off on orders above ₹1999',
      termsAndConditions: [
        'Offer is valid only on select restaurants',
        'Coupon code can be applied only once in 2 hrs',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-08-30T23:59:59'),
      couponType: 'mega'
    },
    {
      code: 'ICICIAPAY',
      discountType: 'percentage',
      discountValue: 5,
      minOrderAmount: 299,
      title: 'Get 5% discount using Amazon Pay ICICI Bank Credit Cards',
      description: 'Flat 5% discount on orders above ₹299',
      termsAndConditions: [
        'Valid only on Amazon Pay ICICI Bank Credit Cards',
        'Not applicable on other variants of ICICI Bank Credit Cards, ICICI Bank Corporate Cards, ICICI Bank Debit Cards, UPI & Net Banking',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'standard'
    },
    {
      code: 'VISAPLATINUMCC',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 75,
      minOrderAmount: 600,
      title: 'Get 10% OFF using Visa Platinum Credit Cards',
      description: 'Maximum upto ₹75 discount on orders above ₹600',
      termsAndConditions: [
        'Valid on Visa Platinum Credit Cards',
        'Maximum discount is ₹75',
        'Other T&Cs may apply'
      ],
      validUntil: new Date('2026-07-31T23:59:59'),
      couponType: 'standard'
    }
  ];

  await Coupon.insertMany(coupons);
  console.log('Coupons seeded successfully');
  process.exit();
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});
