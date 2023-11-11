import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Joi from "joi";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    name: Joi.string()
      .ruleset.pattern(
        new RegExp(/^[A-Za-z ]{3,20}$/),
        "Name should have at least 3 characters and should not any number!"
      )
      .rule({
        message: `Name should have at least 3 characters and should not any number!`,
      })
      .required(),
    email: Joi.string()
      .ruleset.email()
      .rule({ message: `Email is invalid` })
      .required(),
    password: Joi.string()
      .ruleset.pattern(
        new RegExp(
          /^(?=.*[0-9])(?=.*[A-Z ])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&* ]{8,20}$/
        ),
        "Password must contain at least 8 characters, 1 number, 1 lowercase and 1 special character!"
      )
      .rule({
        message: `Password must contain at least 8 characters, 1 number, 1 lowercase and 1 special character!`,
      })
      .required(),
  });

  const { error } = signupSchema.validate(body, { abortEarly: false });
  if (error) {
    return res.json(
      {
        success: false,
        error: error.details[0].message,
      },
      {
        status: 400,
      }
    );
  }

  const { name, email, password } = body;

  try {
    await connectToDB();
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return res.json(
        {
          success: false,
          error: "User already exists",
        },
        {
          status: 400,
        }
      );
    } else {
      const user = new User({
        name,
        email,
        password,
      });
      await user.save();
      return res.json(
        {
          success: true,
          msg: "User Registered Successfully",
        },
        {
          status: 201,
        }
      );
    }
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
