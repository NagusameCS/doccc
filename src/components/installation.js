/**
 * Installation Component
 */

export async function renderInstallation(config, context = {}) {
    const { id = 'installation', title = '📦 Installation', content = {} } = config;
    const { packageManager = 'auto', showAll = true, customSteps = [] } = content;

    const pkg = context.config?.project?.name || 'package-name';
    const lines = [`<h2 id="${id}">${title}</h2>`, ''];

    if (showAll) {
        lines.push('```bash');
        lines.push(`# npm`);
        lines.push(`npm install ${pkg}`);
        lines.push('');
        lines.push(`# yarn`);
        lines.push(`yarn add ${pkg}`);
        lines.push('');
        lines.push(`# pnpm`);
        lines.push(`pnpm add ${pkg}`);
        lines.push('```');
    } else {
        const cmd = packageManager === 'yarn' ? 'yarn add' :
            packageManager === 'pnpm' ? 'pnpm add' : 'npm install';
        lines.push('```bash');
        lines.push(`${cmd} ${pkg}`);
        lines.push('```');
    }

    if (customSteps.length > 0) {
        lines.push('', '### Additional Steps', '');
        customSteps.forEach((step, i) => {
            lines.push(`${i + 1}. ${step}`);
        });
    }

    return lines.join('\n');
}
