import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        {isRouteErrorResponse(error) ? (
          <i>{error.statusText}</i>
        ) : (
          <i>{(error as Error)?.message ?? "Unknown Error"}</i>
        )}
      </p>
    </div>
  );
}
