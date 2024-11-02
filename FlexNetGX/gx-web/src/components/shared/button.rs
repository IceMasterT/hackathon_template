// FlexNetGX/gx-web/src/components/gx-mobile/button.rs
use yew::prelude::*;

#[derive(Properties, Clone, PartialEq)]
pub struct ButtonProps {
    #[prop_or_default]
    pub children: Children,
    #[prop_or_default]
    pub onclick: Callback<MouseEvent>,
    #[prop_or("primary".to_string())]
    pub variant: String,
    #[prop_or_default]
    pub disabled: bool,
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
            "primary" => "bg-accent-color hover:bg-accent-hover text-white",
            "secondary" => "bg-secondary-bg hover:bg-secondary-hover text-primary",
            "danger" => "bg-red-600 hover:bg-red-700 text-white",
            _ => "bg-gray-200 hover:bg-gray-300 text-gray-800"
        };

        let disabled_classes = if self.props.disabled {
            "opacity-50 cursor-not-allowed"
        } else {
            "cursor-pointer"
        };

        html! {
            <button 
                class=classes!(base_classes, variant_classes, disabled_classes)
                onclick=self.props.onclick.clone()
                disabled=self.props.disabled
            >
                { self.props.children.clone() }
            </button>
        }
    }
}