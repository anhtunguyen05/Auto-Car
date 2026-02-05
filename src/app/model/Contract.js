import mongoose from "mongoose";
import {ContractStatus ,ContractStatusValues } from "../../enum/contract.enum.js";

const contractSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car",
            required: true,
        },
        contractDate: { 
            type: Date, 
            required: true, 
            default: Date.now
        },
        status: {
            type: String,
            enum: ContractStatusValues,
            default: ContractStatus.ACTIVE,
        },
        totalCost: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;