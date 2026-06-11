import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profilePic: {
            type: String

        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        },
        verified:{
            type:Boolean,
            default:false
        }
    },
    { timestamps: true }
)

userSchema.index({ email: 1, projectId: 1 }, { unique: true });

export default mongoose.model("User", userSchema)

