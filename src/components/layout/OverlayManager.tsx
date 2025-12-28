"use client";

import * as React from "react";
import { MaintenanceBanner } from "./MaintenanceBanner";
import { AnnouncementsOverlay } from "./AnnouncementsOverlay";
import { FoundingMemberPopup } from "./FoundingMemberPopup";
import { getGeneralSettings } from "@/lib/settings";

export function OverlayManager() {
    const [maintenanceMode, setMaintenanceMode] = React.useState(false);
    const [maintenanceDismissed, setMaintenanceDismissed] = React.useState(false);
    const [announcementOpen, setAnnouncementOpen] = React.useState(false);

    // Check global settings for maintenance mode
    React.useEffect(() => {
        getGeneralSettings().then(s => setMaintenanceMode(s.maintenance_mode));
    }, []);

    // Priority Logic:
    // 1. Maintenance Banner (Highest)
    // 2. Announcements
    // 3. Founding Member Popup (Lowest)

    // If Maintenance is active and NOT dismissed, we suppress lower modals.
    // If Maintenance is active but dismissed, user "entered" site, so we might show others?
    // User request: "If a higher-priority modal is active, lower ones wait until it's dismissed."
    // MaintenanceBanner interacts as "active" if it's visible.

    const isMaintenanceVisible = maintenanceMode && !maintenanceDismissed;
    const isAnnouncementVisible = announcementOpen;

    // Founding Popup only shows if Maintenance is handled (dismissed or off) AND Announcement is closed
    const canShowFounding = !isMaintenanceVisible && !isAnnouncementVisible;

    // Announcements usually self-manage if they have content, but we might want to suppress if maintenance is blocking?
    // If Maintenance is strict (banner visible covering top), maybe we allow Announcement overlay (centered modal)?
    // Usually Modal > Banner in Z-index.
    // But if "Maintenance Mode (highest)" means priority of attention:
    // We should probably NOT suppress Announcement just because Banner is there, unless Announcement logic checks it.
    // But `canShowFounding` definitely waits for Announcement.

    // Let's assume Announcements can trigger whenever, but Founding waits for Announcement.
    // Maintenance Banner is persistent at top, doesn't necessarily block center Modals unless we decide so.
    // But the requirements say: "If a higher-priority modal is active, lower ones wait".
    // "Maintenance Mode" is listed as a Modal/Overlay priority. 
    // If it's just a top banner, it doesn't "block" the screen like a Modal.
    // However, if the user INTENDS for Maintenance Mode to be a "Blocking Modal" (which it isn't currently, it's a Banner), then I should probably treat it as such.
    // But based on current code, it's a Banner.
    // I will let Maintenance Banner show.
    // I will let Announcement show (since it's critical info).
    // I will make Founding Popup wait for Announcement.
    // AND Founding Popup wait for Maintenance? Maybe.
    // I'll stick to variable `canShowFounding` which respects both.

    return (
        <>
            <MaintenanceBanner
                active={isMaintenanceVisible}
                onDismiss={() => setMaintenanceDismissed(true)}
            />

            {/* Announcement controls its own visibility based on data, but reports state */}
            {/* If we strictly want to HIDE announcement during legacy maintenance, we could conditionally render it */}
            {/* But usually Announcements are used to announce maintenance end etc. so keeping it visible is good. */}

            <AnnouncementsOverlay onOpenChange={setAnnouncementOpen} />

            <FoundingMemberPopup canShow={canShowFounding} />
        </>
    );
}
