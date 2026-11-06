export const requireAuth = async (c, next) => {
  if (!c.req.header('authorization')) return c.text('Sign in first', 401);
  await next();
};
