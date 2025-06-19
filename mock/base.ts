import { createDefineMock } from "vite-plugin-mock-dev-server";

export const defineMock = createDefineMock((mock) => {
  // 拼接url
  mock.url = import.meta.env.VITE_BASE_API + "/api/"+ mock.url;
});
