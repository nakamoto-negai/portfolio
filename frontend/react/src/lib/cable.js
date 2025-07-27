import { createConsumer } from "@rails/actioncable";
export const cable = createConsumer("ws://localhost:3000/cable");