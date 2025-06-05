import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  static async requestPermissions() {
    const permissionStatus = await LocalNotifications.requestPermissions();
    return permissionStatus.display === 'granted';
  }

  static async scheduleWeightReminder() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Время взвешивания",
          body: "Не забудьте записать свой вес сегодня!",
          id: 1,
          schedule: { at: this.getTomorrowMorning() },
          sound: 'beep.wav',
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  private static getTomorrowMorning(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }

  static async cancelAllNotifications() {
    await LocalNotifications.cancel({ notifications: [] });
  }
}
