import { inngest } from "../client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" }, // ✅ đúng cú pháp v3
  async ({ event, step }: any) => {
    await step.sleep("wait-a-moment", "1s");

    return {
      message: `Hello ${event.data.hello}!`
    };
  }
);