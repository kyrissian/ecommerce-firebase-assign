import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Logout from "../pages/Logout";

test("matches snapshot", () => {
  // Render the component inside a MemoryRouter so useNavigate() has context
  const { asFragment } = render(
    <MemoryRouter>
      <Logout />
    </MemoryRouter>,
  );

  // Create a snapshot of the rendered component
  expect(asFragment()).toMatchSnapshot();
});
