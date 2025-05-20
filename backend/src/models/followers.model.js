import mongoose, {Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const followSchema = new Schema({
        follower: [
        { 
            type: Schema.Types.ObjectId,  //who is following
            ref: 'User'
        }
        ],
        profile: [
        {
            type: Schema.Types.ObjectId, //to whom follower has followed
            ref:'User'
        }
    ],
},{timestamps: true})


export const Followers = mongoose.model('Follower',followSchema)