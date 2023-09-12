import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    //get reqbody
    const reqBody = await request.json();
    const { email, password } = reqBody;

    //check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }
    console.log("user exists");

    //check if password is correct
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }
    console.log(user, "user");

    //create token data
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    //create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    //set response
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    });

    //set cookies
    response.cookies.set("token", token, { httpOnly: true });

    //return response
    return response
    
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
