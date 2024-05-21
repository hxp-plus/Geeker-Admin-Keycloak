import { createApp } from "vue";
import App from "./App.vue";
// reset style sheet
import "@/styles/reset.scss";
// CSS common style sheet
import "@/styles/common.scss";
// iconfont css
import "@/assets/iconfont/iconfont.scss";
// font css
import "@/assets/fonts/font.scss";
// element css
import "element-plus/dist/index.css";
// element dark css
import "element-plus/theme-chalk/dark/css-vars.css";
// custom element dark css
import "@/styles/element-dark.scss";
// custom element css
import "@/styles/element.scss";
// svg icons
import "virtual:svg-icons-register";
// element plus
import ElementPlus from "element-plus";
// element icons
import * as Icons from "@element-plus/icons-vue";
// custom directives
import directives from "@/directives/index";
// vue Router
import router from "@/routers";
// vue i18n
import I18n from "@/languages/index";
// pinia store
import pinia from "@/stores";
// errorHandler
import errorHandler from "@/utils/errorHandler";

// 引入Keycloak
// 参考：https://github.com/achernetsov/vue-keycloak-template
import Keycloak, { type KeycloakConfig, type KeycloakInitOptions } from "keycloak-js";
import { useKeycloakStore } from "@/stores/modules/keycloakStore";

const app = createApp(App);

app.config.errorHandler = errorHandler;

// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons]);
});

// pinia等组件必须在这里初始化
app.use(ElementPlus).use(directives).use(router).use(I18n).use(pinia);

let keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_APP_KEYCLOAK_OPTIONS_URL,
  realm: import.meta.env.VITE_APP_KEYCLOAK_OPTIONS_REALM,
  clientId: import.meta.env.VITE_APP_KEYCLOAK_OPTIONS_CLIENTID
};
let keycloak = new Keycloak(keycloakConfig);
const keycloakStore = useKeycloakStore();
keycloakStore.keycloak = keycloak;
let initOptions: KeycloakInitOptions = {
  onLoad: "login-required",
  enableLogging: true,
  responseMode: "query" // 参考：https://github.com/keycloak/keycloak/issues/14742
};
keycloak.init(initOptions).then(auth => {
  if (!auth) {
    console.warn("Authentication failed");
  } else {
    console.log("Authenticated");
    keycloak.loadUserInfo().then(() => {
      app.mount("#app");
    });
  }
  //Token Refresh
  setInterval(() => {
    keycloak
      .updateToken(70)
      .then(refreshed => {
        if (refreshed) {
          console.log("Token refreshed");
        } else {
          console.warn("Token not refreshed");
        }
      })
      .catch(() => {
        console.error("Failed to refresh token");
      });
  }, 6000);
});
