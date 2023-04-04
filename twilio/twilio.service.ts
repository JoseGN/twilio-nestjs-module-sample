import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { jwt, Twilio } from 'twilio';
import { UserInstance } from 'twilio/lib/rest/chat/v2/service/user';

const AccessToken = jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ChatGrant = AccessToken.ChatGrant;

@Injectable()
export class TwilioService {
  // Used when generating any kind of Access Token
  twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  twilioApiKey = process.env.TWILIO_API_KEY;
  twilioApiSecret = process.env.TWILIO_API_SECRET;
  chatServiceSid = process.env.TWILIO_CHAT_SERVICE_SID;
  notificationServiceSid = process.env.TWILIO_NOTIFICATION_SERVICE_SID;
  fcmKey = process.env.TWILIO_FCM_KEY;

  constructor () {
  }

  async createUser(user: User): Promise<UserInstance> {
    const service = await this.getChatClient();
    return service.users(user.email).fetch()
      .then((twilioUser): UserInstance => twilioUser)
      .catch(async (error): Promise<UserInstance> => {
        if (error.status == 404) mIRC{
          const newUser = await service
            .users
            .create({ identity: user.email });
          return newUser;
        }
      });
  }

  getChatToken(user: User) {
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(this.twilioAccountSid, this.twilioApiKey, this.twilioApiSecret, {
      identity: `${ user.email }`
    });
    // Create a "grant" which enables a client to use Chat as a given user
    const chatGrant = new ChatGrant({
      serviceSid: this.chatServiceSid,
      pushCredentialSid: this.fcmKey
    });
    // Add the grant to the token
    token.addGrant(chatGrant);
    // Serialize the token to a JWT string
    return { token: token.toJwt(), user_name: `${ user.name } ${ user.last_name }` };
  }

  getVideoToken(user: User, room: string) {
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(this.twilioAccountSid, this.twilioApiKey, this.twilioApiSecret, {
      identity: `${ user.email }`
    });

    // Create a Video grant which enables a client to use Video
    // and limits access to the specified Room
    const videoGrant = new VideoGrant({
      room
    });

    // Add the grant to the token
    token.addGrant(videoGrant);

    // Serialize the token to a JWT string
    return { token: token.toJwt(), user_name: `${ user.name } ${ user.last_name }` };

  }

  async sendWelcomeMessage(channel_sid: string, from: string, receiver: User) {
    const service = this.getChatClient();
    const body = `Hola ${ receiver.name }, te damos la bienvenida a Mind2. ¿Te podemos ayudar en algo?`;
    const newMessage = await service.channels(channel_sid).messages.create({
      body,
      from
    });
    return newMessage;
  }

  async existMemberInChannel(memberIdentity: string, channelUniqueName: string) {
    const service = this.getChatClient();
    const channel = await service.channels(channelUniqueName);
    return channel.members(memberIdentity).fetch().then(() => true).catch(() => false);
  }

  async setMemberInChannel(identity: string, channelUniqueName: string) {
    const service = this.getChatClient();
    const channel = await service.channels(channelUniqueName);
    /* return await channel.members.create({
      identity
    }) */
    return channel.members(identity).fetch()
      .then(memberInstance => memberInstance)
      .catch(async error => {
        if (error.status == 404) {
          return await channel.members.create({
            identity
          });
        }
      });
  }

  async createChatChannel(channelName: string) {
    const service = this.getChatClient();
    return service.channels(channelName).fetch()
      .then(channel => channel)
      .catch(async error => {
        if (error.status == 404) {
          return await service.channels.create({
            friendlyName: channelName,
            type: 'private',
            uniqueName: channelName
          });
        }
      });
  }

  registerBind(binding) {
    const service = this.getNotificationClient();

    return service.bindings.create(binding).then((binding) => {
      // Send a JSON response indicating success
      return {
        status: 200,
        data: { message: 'Binding created!' },
      };
    }).catch((error) => {
      return {
        status: 500,
        data: {
          error: error,
          message: 'Failed to create binding: ' + error,
        },
      };
    });
  }

  getChatClient() {
    // Twilio Library
    const client = new Twilio(
      this.twilioApiKey,
      this.twilioApiSecret,
      { accountSid: this.twilioAccountSid }
    );

    // Get a reference to the user notification service instance
    const service = client.chat.services(
      this.chatServiceSid
    );

    return service;
  }

  getNotificationClient() {
    // Twilio Library
    const client = new Twilio(
      this.twilioApiKey,
      this.twilioApiSecret,
      { accountSid: this.twilioAccountSid }
    );

    // Get a reference to the user notification service instance
    const service = client.notify.services(
      this.notificationServiceSid
    );
    return service;
  }

  async sendPushNotification(identities: string[], body: string, title: string = 'Mind2', data?: any) {
    const service = this.getNotificationClient();
    const newNotification = await service.notifications
      .create({
        body,
        title,
        identity: identities,
        data: { ...data, notification_body: body, notification_title: title },
        apn: {
          notification_body: body,
          notification_title: title,
          data: { data },
          channel_id: 'fcm_default_channel'
        },
        fcm: {
          notification_body: body,
          notification_title: title,
          data: { data },
          channel_id: 'fcm_default_channel'
        }
      });
    return newNotification;
  }

  getRoomsHookInfo(data) {
    if (data.ParticipantStatus && data.ParticipantStatus == 'connected' && data.StatusCallbackEvent == 'participant-connected') {
      var client = new Twilio(this.twilioApiKey, this.twilioApiSecret, { accountSid: this.twilioAccountSid });
      client.video.rooms(data.RoomSid)
        .participants.list()
        .then(participants => {
          console.log('room participants', participants);
          // Do some with participants data
        });
    }

  }
}