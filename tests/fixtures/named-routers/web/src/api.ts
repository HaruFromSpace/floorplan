export const listTeams = () => fetch('/api/teams').then((r) => r.json());
export const joinTeam = (id: string) => fetch(`/api/teams/${id}/join`, { method: 'POST' });
export const getMatch = (id: string) => fetch(`/api/matches/${id}`).then((r) => r.json());
export const cancelOrder = (id: string) => fetch(`/shop/orders/${id}`, { method: 'DELETE' });
