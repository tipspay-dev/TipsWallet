// Cloud Backup and Social Recovery Hooks
export const useSocialRecovery = () => {
    const backupToCloud = async (provider: string) => {
        console.log(`${provider} yedekleme başlatıldı.`);
    };
    return { backupToCloud };
};
