import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
)
const Project = mongoose.model("Project", projectSchema);
export default Project