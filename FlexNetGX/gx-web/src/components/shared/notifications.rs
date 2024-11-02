// FlexNetGX/gx-web/src/components/gx-mobile/notification.rs
use yew::prelude::*;
use std::time::Duration;
use gloo::timers::callback::Timeout;

#[derive(Clone, Debug, PartialEq)]
pub enum NotificationType {
    Success,
    Error,
    Warning,
    Info,
}

#[derive(Clone, Debug)]
pub struct NotificationItem {
    pub id: usize,
    pub message: String,
    pub notification_type: NotificationType,
    pub timeout: Option<Duration>,
}

pub enum Msg {
    AddNotification(NotificationItem),
    RemoveNotification(usize),
}

pub struct NotificationSystem {
    notifications: Vec<NotificationItem>,
    next_id: usize,
    link: ComponentLink<Self>,
}

impl Component for NotificationSystem {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            notifications: vec![],
            next_id: 0,
            link,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::AddNotification(mut notification) => {
                notification.id = self.next_id;
                self.next_id += 1;

                if let Some(timeout) = notification.timeout {
                    let notification_id = notification.id;
                    let link = self.link.clone();
                    
                    let timeout = Timeout::new(timeout.as_millis() as u32, move || {
                        link.send_message(Msg::RemoveNotification(notification_id));
                    });
                    timeout.forget();
                }

                self.notifications.push(notification);
                true
            }
            Msg::RemoveNotification(id) => {
                self.notifications.retain(|n| n.id != id);
                true
            }
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
                <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {
                        for self.notifications.iter().map(|notification| {
                            self.view_notification(notification)
                        })
                    }
                </div>
            </div>
        }
    }
}

impl NotificationSystem {
    fn view_notification(&self, notification: &NotificationItem) -> Html {
        let type_classes = match notification.notification_type {
            NotificationType::Success => "bg-green-500",
            NotificationType::Error => "bg-red-500",
            NotificationType::Warning => "bg-yellow-500",
            NotificationType::Info => "bg-blue-500",
        };

        html! {
            <div class=classes!(
                "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden",
                "transform transition-all duration-300 ease-in-out",
                "hover:scale-105"
            )>
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            {
                                match notification.notification_type {
                                    NotificationType::Success => self.success_icon(),
                                    NotificationType::Error => self.error_icon(),
                                    NotificationType::Warning => self.warning_icon(),
                                    NotificationType::Info => self.info_icon(),
                                }
                            }
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                            <p class="text-sm font-medium text-gray-900">
                                { &notification.message }
                            </p>
                        </div>
                        <div class="ml-4 flex-shrink-0 flex">
                            <button
                                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                onclick=self.link.callback(move |_| Msg::RemoveNotification(notification.id))
                            >
                                <span class="sr-only">{"Close"}</span>
                                { self.close_icon() }
                            </button>
                        </div>
                    </div>
                </div>
                <div class=classes!("h-1", type_classes)></div>
            </div>
        }
    }

    // Icon rendering methods...
}