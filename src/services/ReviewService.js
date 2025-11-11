const { db } = require("../config/firebase");
const AccountService = require('../services/AccountService');
const UserService = require('../services/UserService');
const { formatDate } = require("../utils/formatDate");

class ReviewService {
    constructor() {}

    async createReview(validated) {
        try {
            const [ reviewRef, reviewed ] = await Promise.all([
                db.collection('reviews').add(validated),
                db.collection('orders').doc(validated.orderID).update({
                    isReview: true
                })
            ])

            return { uid: reviewRef.id, rating: validated.rating, comment: validated.comment };
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo đánh giá không thành công")
        }
    }

    async getExperienceOfWorker(workerID) {
        try {
            const experiences = {
                'CLEANING': {
                    stars: [],
                    reviews: []
                },
                'HEALTHCARE': {
                    stars: [],
                    reviews: []
                },
                'MAINTENENCE': {
                    stars: [],
                    reviews: []
                }
            };

            const snapshot = await db.collection('reviews').where('workerID', '==', workerID).get();

            for (const doc of snapshot.docs) {
                const userDoc = await UserService.getByUID(doc.data().userID);

                const review = {
                    uid: doc.id,
                    user: userDoc,
                    isReview: doc.data().isReview,
                    rating: doc.data().rating,
                    comment: doc.data().comment,
                }

                experiences[doc.data().serviceType]['stars'].push(doc.data().rating);
                experiences[doc.data().serviceType]['reviews'].push(review);
            }

            const result = {};
            for (const key of Object.keys(experiences)) {
                if (experiences[key]['reviews'].length===0) {
                    continue;
                }

                const avgOfStars = experiences[key]['stars'].reduce((sum, num) => sum + num, 0) / experiences[key]['stars'].length;
                const info = {
                    rating: parseFloat(avgOfStars.toFixed(1)),
                    reviews: experiences[key]['reviews']
                }
                result[key] = info
            }

            return result;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async getReviewByOrderID(orderID) {
        try {
            const snapshot = await db.collection('reviews').where('orderID', '==', orderID).get();
            if (snapshot.empty) {
                throw new Error("No review found for this order");
            }

            const reviewDoc = snapshot.docs[0];

            return { uid: reviewDoc.id, rating: reviewDoc.data().rating, comment: reviewDoc.data().comment }
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }
}

module.exports = new ReviewService();