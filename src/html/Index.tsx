import * as Sentry from "@sentry/react";
import {createRoot} from "react-dom/client";
import {App} from "./App";



Sentry.init({
    dsn: "https://fac3671d32b0713a76639f41f42b581b@o44118.ingest.us.sentry.io/4508433303797760",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});



const root = createRoot(document.getElementById('root')!);
root.render(<App/>);