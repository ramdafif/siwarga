import { getCurrentUser } from '@/lib/auth/session';
import { store } from '@/lib/db/store';
import { AppShell } from '@/components/layout/AppShell';
import { filterComplaintsByRole } from '@/lib/auth/rbac';
import { WargaDashboard } from '@/components/dashboard/WargaDashboard';
import { RTDashboard } from '@/components/dashboard/RTDashboard';
import { RWDashboard } from '@/components/dashboard/RWDashboard';
import { KarangTarunaDashboard } from '@/components/dashboard/KarangTarunaDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const role = currentUser?.role || 'WARGA';

  // Base dataset
  const allComplaints = store.getComplaints();
  const allUsers = store.getUsers();
  const allRWs = store.getRWs();
  const allRTs = store.getRTs();

  // 1. FOR WARGA
  if (role === 'WARGA') {
    const myComplaints = currentUser
      ? allComplaints.filter((c) => c.reporter_id === currentUser.id)
      : [];
    const publicComplaints = allComplaints.filter(
      (c) => c.is_public && c.reporter_id !== currentUser?.id
    );

    const announcements = store.getAnnouncements({
      rw_id: currentUser?.rw_id,
      rt_id: currentUser?.rt_id,
    });
    const events = store.getEvents(currentUser?.rw_id);

    // Look up RT & RW info
    const rt = allRTs.find((r) => r.id === currentUser?.rt_id);
    const rw = allRWs.find((r) => r.id === currentUser?.rw_id);

    return (
      <AppShell currentUser={currentUser}>
        <WargaDashboard
          currentUser={currentUser!}
          myComplaints={myComplaints}
          publicComplaints={publicComplaints}
          announcements={announcements}
          events={events}
          rtName={rt?.name}
          rwName={rw?.name}
          rtLeaderName={rt?.leader_name}
          rtLeaderPhone={rt?.leader_phone}
          rwLeaderName={rw?.leader_name}
          rwLeaderPhone={rw?.leader_phone}
        />
      </AppShell>
    );
  }

  // 2. FOR ADMIN RT
  if (role === 'ADMIN_RT') {
    const rtId = currentUser?.rt_id;
    const rt = allRTs.find((r) => r.id === rtId);
    const rw = allRWs.find((r) => r.id === currentUser?.rw_id);

    // Complaints within this RT
    const rtComplaints = allComplaints.filter((c) => c.rt_id === rtId);
    // Citizens in this RT
    const rtWarga = allUsers.filter((u) => u.rt_id === rtId && u.role === 'WARGA');
    // Announcements in this RT/RW
    const rtAnnouncements = store.getAnnouncements({
      rw_id: currentUser?.rw_id,
      rt_id: rtId,
    });

    return (
      <AppShell currentUser={currentUser}>
        <RTDashboard
          currentUser={currentUser!}
          complaints={rtComplaints}
          wargaList={rtWarga}
          announcements={rtAnnouncements}
          rtName={rt?.name}
          rwName={rw?.name}
          rtNumber={rt?.number}
          rwNumber={rw?.number}
        />
      </AppShell>
    );
  }

  // 3. FOR ADMIN RW
  if (role === 'ADMIN_RW') {
    const rwId = currentUser?.rw_id;
    const rw = allRWs.find((r) => r.id === rwId);
    const rwRTs = allRTs.filter((r) => r.rw_id === rwId);
    const rwComplaints = allComplaints.filter((c) => c.rw_id === rwId);
    const rwAnnouncements = store.getAnnouncements({ rw_id: rwId });

    return (
      <AppShell currentUser={currentUser}>
        <RWDashboard
          currentUser={currentUser!}
          complaints={rwComplaints}
          rts={rwRTs}
          announcements={rwAnnouncements}
          rwName={rw?.name}
          rwNumber={rw?.number}
        />
      </AppShell>
    );
  }

  // 4. FOR KARANG TARUNA
  if (role === 'KARANG_TARUNA') {
    const rwId = currentUser?.rw_id;
    const assignedComplaints = allComplaints.filter((c) =>
      c.assignments?.some((a) => a.assigned_to_role === 'KARANG_TARUNA')
    );
    const events = store.getEvents(rwId);
    const announcements = store.getAnnouncements({ rw_id: rwId });

    return (
      <AppShell currentUser={currentUser}>
        <KarangTarunaDashboard
          currentUser={currentUser!}
          assignedComplaints={assignedComplaints}
          events={events}
          announcements={announcements}
        />
      </AppShell>
    );
  }

  // 5. FOR SUPER ADMIN
  const totalWarga = allUsers.filter((u) => u.role === 'WARGA').length;

  return (
    <AppShell currentUser={currentUser}>
      <SuperAdminDashboard
        currentUser={currentUser!}
        complaints={allComplaints}
        rws={allRWs}
        rts={allRTs}
        totalWarga={totalWarga}
      />
    </AppShell>
  );
}
