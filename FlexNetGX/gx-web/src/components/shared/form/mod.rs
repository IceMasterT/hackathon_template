// FlexNetGX/gx-web/src/components/gx-mobile/form/mod.rs
use yew::prelude::*;
use std::collections::HashMap;
use validator::{Validate, ValidationErrors};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq)]
pub enum FormMsg {
    SetField(String, String),
    Submit,
    Reset,
    SetError(String, String),
    ClearError(String),
}

#[derive(Properties, Clone, PartialEq)]
pub struct FormProps<T: Clone + Default + PartialEq + Validate + 'static> {
    #[prop_or_default]
    pub onsubmit: Callback<T>,
    #[prop_or_default]
    pub initial_data: Option<T>,
    #[prop_or_default]
    pub children: Children,
}

pub struct Form<T: Clone + Default + PartialEq + Validate + 'static> {
    data: T,
    errors: HashMap<String, String>,
    link: ComponentLink<Self>,
    props: FormProps<T>,
}

impl<T: Clone + Default + PartialEq + Validate + 'static> Component for Form<T> {
    type Message = FormMsg;
    type Properties = FormProps<T>;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            data: props.initial_data.clone().unwrap_or_default(),
            errors: HashMap::new(),
            link,
            props,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            FormMsg::SetField(field, value) => {
                // Update field value (needs implementation based on T)
                self.errors.remove(&field);
                true
            }
            FormMsg::Submit => {
                match self.data.validate() {
                    Ok(_) => {
                        self.props.onsubmit.emit(self.data.clone());
                        true
                    }
                    Err(errors) => {
                        self.handle_validation_errors(errors);
                        true
                    }
                }
            }
            FormMsg::Reset => {
                self.data = self.props.initial_data.clone().unwrap_or_default();
                self.errors.clear();
                true
            }
            FormMsg::SetError(field, error) => {
                self.errors.insert(field, error);
                true
            }
            FormMsg::ClearError(field) => {
                self.errors.remove(&field);
                true
            }
        }
    }

    fn view(&self) -> Html {
        html! {
            <form
                onsubmit=self.link.callback(|e: FocusEvent| {
                    e.prevent_default();
                    FormMsg::Submit
                })
                class="space-y-6"
            >
                { self.props.children.clone() }
            </form>
        }
    }
}

// Input Component
#[derive(Properties, Clone, PartialEq)]
pub struct InputProps {
    pub name: String,
    pub label: String,
    #[prop_or_default]
    pub value: String,
    #[prop_or("text".to_string())]
    pub input_type: String,
    #[prop_or_default]
    pub placeholder: String,
    #[prop_or_default]
    pub required: bool,
    #[prop_or_default]
    pub disabled: bool,
    #[prop_or_default]
    pub error: Option<String>,
    #[prop_or_default]
    pub onchange: Callback<String>,
}

pub struct Input {
    props: InputProps,
    link: ComponentLink<Self>,
}

impl Component for Input {
    type Message = String;
    type Properties = InputProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { props, link }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        self.props.onchange.emit(msg);
        false
    }

    fn view(&self) -> Html {
        html! {
            <div class="form-control">
                <label
                    for=&self.props.name
                    class="block text-sm font-medium text-gray-700"
                >
                    { &self.props.label }
                    {
                        if self.props.required {
                            html! { <span class="text-red-500">{"*"}</span> }
                        } else {
                            html! {}
                        }
                    }
                </label>
                <input
                    type=&self.props.input_type
                    id=&self.props.name
                    name=&self.props.name
                    class=classes!(
                        "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
                        "focus:border-indigo-500 focus:ring-indigo-500",
                        self.props.error.is_some().then(|| "border-red-300"),
                    )
                    placeholder=&self.props.placeholder
                    value=&self.props.value
                    required=self.props.required
                    disabled=self.props.disabled
                    oninput=self.link.callback(|e: InputEvent| {
                        let input: web_sys::HtmlInputElement = e.target_unchecked_into();
                        input.value()
                    })
                />
                {
                    if let Some(error) = &self.props.error {
                        html! {
                            <p class="mt-2 text-sm text-red-600">
                                { error }
                            </p>
                        }
                    } else {
                        html! {}
                    }
                }
            </div>
        }
    }
}

// Select Component
#[derive(Properties, Clone, PartialEq)]
pub struct SelectProps<T: Clone + PartialEq + 'static> {
    pub name: String,
    pub label: String,
    pub options: Vec<SelectOption<T>>,
    #[prop_or_default]
    pub value: Option<T>,
    #[prop_or_default]
    pub placeholder: String,
    #[prop_or_default]
    pub required: bool,
    #[prop_or_default]
    pub disabled: bool,
    #[prop_or_default]
    pub error: Option<String>,
    #[prop_or_default]
    pub onchange: Callback<Option<T>>,
}

#[derive(Clone, PartialEq)]
pub struct SelectOption<T: Clone + PartialEq> {
    pub label: String,
    pub value: T,
    pub disabled: bool,
}

pub struct Select<T: Clone + PartialEq + 'static> {
    props: SelectProps<T>,
    link: ComponentLink<Self>,
}

impl<T: Clone + PartialEq + 'static> Component for Select<T> {
    type Message = Option<T>;
    type Properties = SelectProps<T>;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { props, link }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        self.props.onchange.emit(msg);
        false
    }

    fn view(&self) -> Html {
        html! {
            <div class="form-control">
                <label
                    for=&self.props.name
                    class="block text-sm font-medium text-gray-700"
                >
                    { &self.props.label }
                    {
                        if self.props.required {
                            html! { <span class="text-red-500">{"*"}</span> }
                        } else {
                            html! {}
                        }
                    }
                </label>
                <select
                    id=&self.props.name
                    name=&self.props.name
                    class=classes!(
                        "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
                        "focus:border-indigo-500 focus:ring-indigo-500",
                        self.props.error.is_some().then(|| "border-red-300"),
                    )
                    required=self.props.required
                    disabled=self.props.disabled
                    onchange=self.link.callback(|e: ChangeData| {
                        if let ChangeData::Select(select) = e {
                            let index = select.selected_index() as usize;
                            Some(index)
                        } else {
                            None
                        }
                    })
                >
                    {
                        if !self.props.placeholder.is_empty() {
                            html! {
                                <option value="" disabled=true selected=self.props.value.is_none()>
                                    { &self.props.placeholder }
                                </option>
                            }
                        } else {
                            html! {}
                        }
                    }
                    {
                        for self.props.options.iter().map(|option| {
                            html! {
                                <option
                                    value=option.value.clone()
                                    disabled=option.disabled
                                    selected=self.props.value.as_ref() == Some(&option.value)
                                >
                                    { &option.label }
                                </option>
                            }
                        })
                    }
                </select>
                {
                    if let Some(error) = &self.props.error {
                        html! {
                            <p class="mt-2 text-sm text-red-600">
                                { error }
                            </p>
                        }
                    } else {
                        html! {}
                    }
                }
            </div>
        }
    }
}

// Checkbox Component
#[derive(Properties, Clone, PartialEq)]
pub struct CheckboxProps {
    pub name: String,
    pub label: String,
    #[prop_or_default]
    pub checked: bool,
    #[prop_or_default]
    pub disabled: bool,
    #[prop_or_default]
    pub error: Option<String>,
    #[prop_or_default]
    pub onchange: Callback<bool>,
}

pub struct Checkbox {
    props: CheckboxProps,
    link: ComponentLink<Self>,
}

impl Component for Checkbox {
    type Message = bool;
    type Properties = CheckboxProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { props, link }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        self.props.onchange.emit(msg);
        false
    }

    fn view(&self) -> Html {
        html! {
            <div class="relative flex items-start">
                <div class="flex items-center h-5">
                    <input
                        type="checkbox"
                        id=&self.props.name
                        name=&self.props.name
                        class=classes!(
                            "h-4 w-4 text-indigo-600 focus:ring-indigo-500",
                            "border-gray-300 rounded",
                            self.props.error.is_some().then(|| "border-red-300"),
                        )
                        checked=self.props.checked
                        disabled=self.props.disabled
                        onchange=self.link.callback(|e: ChangeData| {
                            if let ChangeData::Value(value) = e {
                                value == "true"
                            } else {
                                false
                            }
                        })
                    />
                </div>
                <div class="ml-3 text-sm">
                    <label
                        for=&self.props.name
                        class="font-medium text-gray-700"
                    >
                        { &self.props.label }
                    </label>
                    {
                        if let Some(error) = &self.props.error {
                            html! {
                                <p class="mt-1 text-sm text-red-600">
                                    { error }
                                </p>
                            }
                        } else {
                            html! {}
                        }
                    }
                </div>
            </div>
        }
    }
}