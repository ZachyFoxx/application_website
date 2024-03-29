import { NextApiResponse } from "next";
import { stringify } from "querystring";
import { NextIronRequest, withSession } from "../../../util/session";
import axios from "axios";
import { dbConnect } from "../../../util/mongodb";
import { decrypt, encrypt } from "../../../util/crypt";
import { DISCORD } from "src/types";
import { getUser } from "src/util/database";

const OAuthScope = ["guilds.members.read", "email", "identify", "guilds", "guilds.join"].join(" ");
const superadmins: string[] = process.env.SUPER_ADMINS as unknown as string[]

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { db } = await dbConnect();

  if (!req.query.code) {
    res.status(404).redirect("/404");
    return;
  }

  

  try {
    const { data } = await axios.post(
      "https://discordapp.com/api/v9/oauth2/token",
      stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: `${process.env.DOMAIN}/api/auth/callback`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // if (data.scope !== OAuthScope) {
    //   return res
    //     .status(403)
    //     .send(
    //       `Expected scope "${OAuthScope}" but received scope "${data.scope}"`
    //     );
    // }

    const { data: user } = await axios.get(
      "https://discordapp.com/api/v9/users/@me",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );

    let discordData;

    try {
      const { data: resData } = await axios.get(`https://discordapp.com/api/v9/users/@me/guilds/${DISCORD.ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        }
      });
      discordData = resData;
    } catch (err: any) {
      
    }


    if (user.email === null) {
      return res
        .status(400)
        .send("Please verify your Discord's account E-mail before logging in.");
    }

    const exists = await db
      .collection("users")
      .countDocuments({ _id: user.id });

    let accessLevel = 0;

    const userExt = {
      email: user.email,
      username: user.username,
      discriminator: user.discriminator,
      accent_color: user.accent_color,
      banner_color: user.banner_color,
      banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
      roles: discordData?.roles || [],
      nick: discordData?.nick || null,
      access_level: discordData?.roles?.includes(DISCORD.SUPERADMIN_ROLE) ? 1 : superadmins?.includes(user.id) ? 1 : 0
    }

    if (exists) {
      await db.collection("users").updateOne(
        { _id: user.id },
        {
          $set: {
            ...userExt
          },
          $addToSet: {
            ip: req.headers["cf-connecting-ip"],
          },
        }
      );

      accessLevel = (await getUser(user.id))!!.access_level;
    } else {
      db.collection("users").insertOne({
        _id: user.id,
        ip: [req.headers["cf-connecting-ip"]],
        token: encrypt(user.id),
        ...userExt
      });
    }

    // const staffUser = await db.collection("staff").findOne({ _id: user.id });

    // if (staffUser) {
    //   db.collection("staff").updateOne(
    //     { _id: user.id },
    //     {
    //       $set: {
    //         banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
    //         avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
    //       },
    //     }
    //   );
    // }

    await req.session.set("user", {
      ...user,
      roles: discordData?.roles || [],
      token: encrypt(user.id),
      access_level: accessLevel,
      member: !!discordData,
      banner: `https://cdn.discordapp.com/banners/${user.id}/${user.banner}`,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
    });
  } catch (e) {
    console.log(e)
    res.redirect('/?r=false')
    return;
  }
  const redirectUrl = req.query.state ? decodeURIComponent(req.query.state as string) : '/discord?r=true';

  await req.session.save();
  res.redirect(redirectUrl)
};

export default withSession(handler);
