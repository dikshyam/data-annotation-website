// Utility functions for handling local storage

/**
 * Save responses to local storage
 * @param {Array} responses - Array of response objects
 */
export const saveResponses = (responses) => {
    try {
      localStorage.setItem('annotationResponses', JSON.stringify(responses));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  };
  
  /**
   * Load responses from local storage
   * @returns {Array} Array of response objects or empty array if none found
   */
  export const loadResponses = () => {
    try {
      const savedResponses = localStorage.getItem('annotationResponses');
      return savedResponses ? JSON.parse(savedResponses) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  };
  
  /**
   * Export responses to JSON file for download
   */
  export const exportResponses = () => {
    try {
      const responses = loadResponses();
      if (responses.length === 0) {
        alert('No responses to export');
        return;
      }
      
      const dataStr = JSON.stringify(responses, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `annotation_responses_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting responses:', error);
      alert('Failed to export responses');
    }
  };