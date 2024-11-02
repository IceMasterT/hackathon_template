// FlexNetGX/gx-web/src/components/gx-mobile/mod.rs
use yew::prelude::*;

pub mod table;
pub mod modal;
pub mod card;
pub mod button;
pub mod form;
pub mod notification;
pub mod loading;
pub mod tabs;

// Button Component
#[derive(Properties, Clone, PartialEq)]
pub struct ButtonProps {
    #[prop_or_default]
    pub children: Children,
    #[prop_or_default]
    pub onclick: Callback<MouseEvent>,
    #[prop_or("primary".to_string())]
    pub variant: String,
    #[prop_or_default]
    pub class: String,
    #[prop_or_default]
    pub disabled: bool,
    #[prop_or("button".to_string())]
    pub button_type: String,
    #[prop_or_default]
    pub loading: bool,
}

pub struct Button {
    props: ButtonProps,
}

impl Component for Button {
    type Message = ();
    type Properties = ButtonProps;

    fn create(props: Self::Properties, _: ComponentLink<Self>) -> Self {
        Self { props }
    }

    fn view(&self) -> Html {
        let base_classes = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
        let variant_classes = match self.props.variant.as_str() {
            "primary" => "bg-indigo-600 hover:bg-indigo-700 text-white",
            "secondary" => "bg-gray-200 hover:bg-gray-300 text-gray-800",
            "danger" => "bg-red-600 hover:bg-red-700 text-white",
            "success" => "bg-green-600 hover:bg-green-700 text-white",
            _ => "bg-gray-100 hover:bg-gray-200 text-gray-800"
        };

        let disabled_classes = if self.props.disabled {
            "opacity-50 cursor-not-allowed"
        } else {
            "cursor-pointer"
        };

        let loading_classes = if self.props.loading {
            "relative !pl-8"
        } else {
            ""
        };

        html! {
            <button
                type=self.props.button_type.clone()
                class=classes!(
                    base_classes,
                    variant_classes,
                    disabled_classes,
                    loading_classes,
                    self.props.class.clone()
                )
                onclick=self.props.onclick.clone()
                disabled=self.props.disabled || self.props.loading
            >
                {
                    if self.props.loading {
                        html! {
                            <span class="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <Loading size="small" />
                            </span>
                        }
                    } else {
                        html! {}
                    }
                }
                { self.props.children.clone() }
            </button>
        }
    }
}

// Modal Component
#[derive(Properties, Clone, PartialEq)]
pub struct ModalProps {
    #[prop_or_default]
    pub children: Children,
    pub show: bool,
    #[prop_or_default]
    pub title: String,
    #[prop_or_default]
    pub onclose: Callback<()>,
    #[prop_or(true)]
    pub closeable: bool,
    #[prop_or_default]
    pub footer: Option<Html>,
    #[prop_or("md".to_string())]
    pub size: String,
}

pub struct Modal {
    props: ModalProps,
}

impl Component for Modal {
    type Message = ();
    type Properties = ModalProps;

    fn create(props: Self::Properties, _: ComponentLink<Self>) -> Self {
        Self { props }
    }

    fn view(&self) -> Html {
        if !self.props.show {
            return html! {};
        }

        let size_class = match self.props.size.as_str() {
            "sm" => "max-w-sm",
            "lg" => "max-w-lg",
            "xl" => "max-w-xl",
            _ => "max-w-md",
        };

        html! {
            <div class="fixed inset-0 z-50 overflow-y-auto"
                aria-labelledby="modal-title"
                role="dialog"
                aria-modal="true"
            >
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        aria-hidden="true"
                        onclick=self.props.onclose.clone()
                    />
                    
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        {"​"}
                    </span>

                    <div class=classes!(
                        "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full",
                        size_class
                    )>
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            {
                                if !self.props.title.is_empty() {
                                    html! {
                                        <div class="mb-4">
                                            <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                                                { &self.props.title }
                                            </h3>
                                        </div>
                                    }
                                } else {
                                    html! {}
                                }
                            }
                            { self.props.children.clone() }
                        </div>

                        {
                            if self.props.footer.is_some() || self.props.closeable {
                                html! {
                                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        { self.props.footer.clone().unwrap_or_default() }
                                        {
                                            if self.props.closeable {
                                                html! {
                                                    <Button
                                                        variant="secondary"
                                                        onclick=self.props.onclose.clone()
                                                        class="mt-3 sm:mt-0 sm:mr-3"
                                                    >
                                                        { "Close" }
                                                    </Button>
                                                }
                                            } else {
                                                html! {}
                                            }
                                        }
                                    </div>
                                }
                            } else {
                                html! {}
                            }
                        }
                    </div>
                </div>
            </div>
        }
    }
}

// Table Component
#[derive(Properties, Clone, PartialEq)]
pub struct TableProps<T: Clone + PartialEq + 'static> {
    pub data: Vec<T>,
    pub columns: Vec<Column<T>>,
    #[prop_or_default]
    pub loading: bool,
    #[prop_or_default]
    pub sortable: bool,
    #[prop_or_default]
    pub onrowclick: Option<Callback<T>>,
    #[prop_or_default]
    pub selected_row: Option<usize>,
    #[prop_or_default]
    pub empty_message: String,
}

pub struct Table<T: Clone + PartialEq + 'static> {
    props: TableProps<T>,
    sort_column: Option<usize>,
    sort_direction: SortDirection,
    link: ComponentLink<Self>,
}

#[derive(Clone, PartialEq)]
pub struct Column<T> {
    pub title: String,
    pub render: Box<dyn Fn(&T) -> Html>,
    pub sortable: bool,
}

pub enum SortDirection {
    Ascending,
    Descending,
}

impl<T: Clone + PartialEq + 'static> Component for Table<T> {
    type Message = ();
    type Properties = TableProps<T>;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            props,
            sort_column: None,
            sort_direction: SortDirection::Ascending,
            link,
        }
    }

    fn view(&self) -> Html {
        html! {
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    { self.render_header() }
                    { self.render_body() }
                </table>
                {
                    if self.props.data.is_empty() && !self.props.loading {
                        html! {
                            <div class="text-center py-8 text-gray-500">
                                { &self.props.empty_message }
                            </div>
                        }
                    } else {
                        html! {}
                    }
                }
            </div>
        }
    }
}