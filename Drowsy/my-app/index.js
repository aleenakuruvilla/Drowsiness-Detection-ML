import { registerRootComponent } from "expo";
import App from "./App";
import { UserProvider } from "./src/context/UserContext";

const AppWrapper = () => (
    <UserProvider>
      <App />
    </UserProvider>
)

registerRootComponent(
  AppWrapper
);
