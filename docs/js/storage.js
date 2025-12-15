/**
 * Storage - LocalStorage and persistence for projects and community
 */

export class Storage {
  constructor() {
    this.projectsKey = 'doccc-projects';
    this.communityKey = 'doccc-community-baseplates';
    this.currentProjectKey = 'doccc-current-project';
  }
  
  // Projects
  async saveProject(project) {
    const projects = this.getProjects();
    
    // Check if updating existing or creating new
    const existingIndex = projects.findIndex(p => p.name === project.name);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }
    
    // Keep only last 20 projects
    if (projects.length > 20) {
      projects.pop();
    }
    
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
    localStorage.setItem(this.currentProjectKey, JSON.stringify(project));
    
    return project;
  }
  
  getProjects() {
    const stored = localStorage.getItem(this.projectsKey);
    return stored ? JSON.parse(stored) : [];
  }
  
  getCurrentProject() {
    const stored = localStorage.getItem(this.currentProjectKey);
    return stored ? JSON.parse(stored) : null;
  }
  
  deleteProject(name) {
    const projects = this.getProjects().filter(p => p.name !== name);
    localStorage.setItem(this.projectsKey, JSON.stringify(projects));
  }
  
  // Community Baseplates
  async publishBaseplate(baseplate) {
    const baseplates = this.getCommunityBaseplates();
    
    // Add to beginning
    baseplates.unshift({
      ...baseplate,
      publishedAt: new Date().toISOString(),
      downloads: 0
    });
    
    localStorage.setItem(this.communityKey, JSON.stringify(baseplates));
    
    return baseplate;
  }
  
  getCommunityBaseplates() {
    const stored = localStorage.getItem(this.communityKey);
    return stored ? JSON.parse(stored) : [];
  }
  
  incrementDownloads(baseplateId) {
    const baseplates = this.getCommunityBaseplates();
    const baseplate = baseplates.find(b => b.id === baseplateId);
    
    if (baseplate) {
      baseplate.downloads++;
      localStorage.setItem(this.communityKey, JSON.stringify(baseplates));
    }
  }
  
  deleteBaseplate(baseplateId) {
    const baseplates = this.getCommunityBaseplates().filter(b => b.id !== baseplateId);
    localStorage.setItem(this.communityKey, JSON.stringify(baseplates));
  }
  
  // Settings
  getSetting(key, defaultValue = null) {
    const settings = this.getSettings();
    return settings[key] ?? defaultValue;
  }
  
  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem('doccc-settings', JSON.stringify(settings));
  }
  
  getSettings() {
    const stored = localStorage.getItem('doccc-settings');
    return stored ? JSON.parse(stored) : {};
  }
  
  // Export/Import
  exportAll() {
    return {
      projects: this.getProjects(),
      community: this.getCommunityBaseplates(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }
  
  importAll(data) {
    if (data.projects) {
      localStorage.setItem(this.projectsKey, JSON.stringify(data.projects));
    }
    if (data.community) {
      localStorage.setItem(this.communityKey, JSON.stringify(data.community));
    }
    if (data.settings) {
      localStorage.setItem('doccc-settings', JSON.stringify(data.settings));
    }
  }
  
  clearAll() {
    localStorage.removeItem(this.projectsKey);
    localStorage.removeItem(this.communityKey);
    localStorage.removeItem(this.currentProjectKey);
    localStorage.removeItem('doccc-settings');
  }
}
