export function err(code: string, details?: unknown) {
  return Response.json(
    {
      success: false,
      error: code,
      details,
    },
    { status: 400 }
  );
}