/**
 * BibTeX parser and citation formatter
 */

// Citation styles
const citationStyles = {
  apa: {
    formatAuthors: authors => {
      if (!authors || authors.length === 0) return '';
      
      if (authors.length === 1) {
        return `${authors[0].lastName}, ${authors[0].firstName.charAt(0)}.`;
      } else if (authors.length < 6) {
        const authorsStr = authors.map((author, i) => {
          if (i === authors.length - 1) {
            return `& ${author.lastName}, ${author.firstName.charAt(0)}.`;
          }
          return `${author.lastName}, ${author.firstName.charAt(0)}.`;
        }).join(', ');
        return authorsStr;
      } else {
        return `${authors[0].lastName}, ${authors[0].firstName.charAt(0)}., et al.`;
      }
    },
    
    formatInlineReference: (entry, authors) => {
      if (!authors) authors = parseAuthors(entry.author);
      if (!authors || authors.length === 0) return `(${entry.year || 'n.d.'})`;
      
      if (authors.length === 1) {
        return `(${authors[0].lastName}, ${entry.year || 'n.d.'})`;
      } else if (authors.length === 2) {
        return `(${authors[0].lastName} & ${authors[1].lastName}, ${entry.year || 'n.d.'})`;
      } else {
        return `(${authors[0].lastName} et al., ${entry.year || 'n.d.'})`;
      }
    },
    
    formatReference: entry => {
      // Parse authors
      const authors = parseAuthors(entry.author);
      const authorsFormatted = citationStyles.apa.formatAuthors(authors);
      
      // Format year
      const year = entry.year || 'n.d.';
      
      // Format title
      const title = entry.title ? `${entry.title}` : '';
      
      // Format journal/publisher info
      let source = '';
      if (entry.journal) {
        source = `<em>${entry.journal}</em>`;
        if (entry.volume) source += `, ${entry.volume}`;
        if (entry.number) source += `(${entry.number})`;
        if (entry.pages) source += `, ${entry.pages}`;
      } else if (entry.booktitle) {
        source = `In <em>${entry.booktitle}</em>`;
        if (entry.pages) source += ` (pp. ${entry.pages})`;
      } else if (entry.publisher) {
        source = `${entry.publisher}`;
      }
      
      // Format DOI
      const doi = entry.doi ? `https://doi.org/${entry.doi}` : '';
      const doiLink = doi ? `<a href="${doi}" target="_blank">${doi}</a>` : '';
      
      return `<p class="citation-text">${authorsFormatted} (${year}). ${title}. ${source}. ${doiLink}</p>`;
    }
  },
  
  mla: {
    formatAuthors: authors => {
      if (!authors || authors.length === 0) return '';
      
      if (authors.length === 1) {
        return `${authors[0].lastName}, ${authors[0].firstName}.`;
      } else if (authors.length === 2) {
        return `${authors[0].lastName}, ${authors[0].firstName}, and ${authors[1].firstName} ${authors[1].lastName}`;
      } else {
        return `${authors[0].lastName}, ${authors[0].firstName}, et al.`;
      }
    },
    
    formatInlineReference: (entry, authors) => {
      if (!authors) authors = parseAuthors(entry.author);
      if (!authors || authors.length === 0) return `(${entry.title ? entry.title.split(' ')[0] : 'n.d.'})`;
      
      return `(${authors[0].lastName} ${authors.length > 1 ? 'et al.' : ''})`;
    },
    
    formatReference: entry => {
      // Parse authors
      const authors = parseAuthors(entry.author);
      const authorsFormatted = citationStyles.mla.formatAuthors(authors);
      
      // Format title
      const title = entry.title ? `"${entry.title}."` : '';
      
      // Format source
      let source = '';
      if (entry.journal) {
        source = `<em>${entry.journal}</em>`;
        if (entry.volume) source += `, vol. ${entry.volume}`;
        if (entry.number) source += `, no. ${entry.number}`;
        if (entry.year) source += `, ${entry.year}`;
        if (entry.pages) source += `, pp. ${entry.pages}`;
      } else if (entry.booktitle) {
        source = `<em>${entry.booktitle}</em>`;
        if (entry.publisher) source += `, ${entry.publisher}`;
        if (entry.year) source += `, ${entry.year}`;
        if (entry.pages) source += `, pp. ${entry.pages}`;
      } else {
        if (entry.publisher) source += `${entry.publisher}`;
        if (entry.year) source += `, ${entry.year}`;
      }
      
      return `<p class="citation-text">${authorsFormatted} ${title} ${source}.</p>`;
    }
  },
  
  chicago: {
    formatAuthors: authors => {
      if (!authors || authors.length === 0) return '';
      
      if (authors.length === 1) {
        return `${authors[0].lastName}, ${authors[0].firstName}.`;
      } else if (authors.length < 4) {
        let result = `${authors[0].lastName}, ${authors[0].firstName}`;
        for (let i = 1; i < authors.length; i++) {
          if (i === authors.length - 1) {
            result += `, and ${authors[i].firstName} ${authors[i].lastName}`;
          } else {
            result += `, ${authors[i].firstName} ${authors[i].lastName}`;
          }
        }
        return result;
      } else {
        return `${authors[0].lastName}, ${authors[0].firstName}, et al.`;
      }
    },
    
    formatInlineReference: (entry, authors) => {
      if (!authors) authors = parseAuthors(entry.author);
      if (!authors || authors.length === 0) return `(${entry.year || 'n.d.'})`;
      
      if (authors.length === 1) {
        return `(${authors[0].lastName} ${entry.year || 'n.d.'})`;
      } else {
        return `(${authors[0].lastName} et al. ${entry.year || 'n.d.'})`;
      }
    },
    
    formatReference: entry => {
      // Parse authors
      const authors = parseAuthors(entry.author);
      const authorsFormatted = citationStyles.chicago.formatAuthors(authors);
      
      // Format title
      const title = entry.title ? `"${entry.title}."` : '';
      
      // Format source & publication info
      let source = '';
      if (entry.journal) {
        source = `<em>${entry.journal}</em>`;
        if (entry.volume) source += ` ${entry.volume}`;
        if (entry.number) source += `, no. ${entry.number}`;
        if (entry.year) source += ` (${entry.year})`;
        if (entry.pages) source += `: ${entry.pages}`;
      } else if (entry.booktitle) {
        source = `In <em>${entry.booktitle}</em>`;
        if (entry.pages) source += `, ${entry.pages}`;
        if (entry.publisher) source += `. ${entry.publisher}`;
        if (entry.year) source += `, ${entry.year}`;
      } else {
        if (entry.publisher) source += `${entry.publisher}`;
        if (entry.year) source += `, ${entry.year}`;
      }
      
      return `<p class="citation-text">${authorsFormatted} ${title} ${source}.</p>`;
    }
  }
};

// Helper functions
function parseAuthors(authorString) {
  if (!authorString) return [];
  
  // Split by 'and' to get individual authors
  const authors = authorString.split(' and ');
  
  return authors.map(author => {
    // Check if author is in "Last, First" format
    if (author.includes(',')) {
      const [lastName, firstName] = author.split(',').map(s => s.trim());
      return { lastName, firstName };
    } else {
      // Assume format is "First Last"
      const parts = author.trim().split(' ');
      const lastName = parts.pop();
      const firstName = parts.join(' ');
      return { lastName, firstName };
    }
  });
}

function parseBibTeXEntry(entry) {
  const result = {};
  
  // Extract entry type and citation key
  const typeMatch = entry.match(/@(\w+)\s*{\s*([^,]+),/i);
  if (typeMatch) {
    result.type = typeMatch[1].toLowerCase();
    result.citationKey = typeMatch[2];
  }
  
  // Match field-value pairs using regex
  const fieldPattern = /\s*(\w+)\s*=\s*{([^{}]*(({[^{}]*})[^{}]*)*)}/g;
  let fieldMatch;
  
  while ((fieldMatch = fieldPattern.exec(entry)) !== null) {
    const field = fieldMatch[1].toLowerCase();
    const value = fieldMatch[2].trim();
    result[field] = value;
  }
  
  return result;
}

async function fetchBibTeXFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to fetch BibTeX file: ${response.statusText}`);
    return await response.text();
  } catch (error) {
    console.error('Error loading BibTeX file:', error);
    return null;
  }
}

function parseBibTeX(bibContent) {
  const entryPattern = /@\w+\s*{[^@]*(?=@|\s*$)/gs;
  const entries = {};
  
  let entryMatch;
  while ((entryMatch = entryPattern.exec(bibContent)) !== null) {
    const entryData = parseBibTeXEntry(entryMatch[0]);
    if (entryData.citationKey) {
      entries[entryData.citationKey] = entryData;
    }
  }
  
  return entries;
}

// Main function to process citations
async function processCitations() {
  // Find all citation elements
  const citations = document.querySelectorAll('.citation');
  const citationMarkers = document.querySelectorAll('.citation-marker');
  
  if (citations.length === 0 && citationMarkers.length === 0) return;
  
  // Group citations by bibFile to minimize fetches
  const bibFiles = new Set();
  citations.forEach(citation => {
    bibFiles.add(citation.dataset.bibFile);
  });
  
  citationMarkers.forEach(marker => {
    bibFiles.add(marker.dataset.bibFile);
  });
  
  // Fetch and parse each BibTeX file
  const bibData = {};
  for (const bibFile of bibFiles) {
    const content = await fetchBibTeXFile(bibFile);
    if (content) {
      bibData[bibFile] = parseBibTeX(content);
    }
  }
  
  // Process each citation
  citations.forEach(citation => {
    const key = citation.dataset.citationKey;
    const bibFile = citation.dataset.bibFile;
    const style = citation.dataset.citationStyle || 'apa';
    const showNotes = citation.dataset.showNotes === 'true';
    
    if (!key || !bibData[bibFile] || !bibData[bibFile][key]) {
      citation.innerHTML = `[Citation not found: ${key}]`;
      return;
    }
    
    const entry = bibData[bibFile][key];
    
    // Format citation according to selected style
    let formattedCitation = '';
    if (citationStyles[style]) {
      formattedCitation = citationStyles[style].formatReference(entry);
    } else {
      formattedCitation = citationStyles.apa.formatReference(entry);
    }
    
    // Add notes if requested
    if (showNotes && entry.note) {
      formattedCitation += `<p class="citation-note">${entry.note}</p>`;
    }
    
    // Update the citation element
    citation.innerHTML = formattedCitation;
    citation.classList.add('citation-processed');
  });
  
  // Process each inline citation marker
  citationMarkers.forEach(marker => {
    const key = marker.dataset.citationKey;
    const bibFile = marker.dataset.bibFile;
    const style = marker.dataset.citationStyle || 'apa';
    
    if (!key || !bibData[bibFile] || !bibData[bibFile][key]) {
      marker.textContent = `[?]`;
      return;
    }
    
    const entry = bibData[bibFile][key];
    const authors = parseAuthors(entry.author);
    
    // Format inline citation
    let inlineCitation = '';
    if (citationStyles[style] && citationStyles[style].formatInlineReference) {
      inlineCitation = citationStyles[style].formatInlineReference(entry, authors);
    } else {
      // Default to numeric citation if style doesn't support inline
      inlineCitation = `[${key}]`;
    }
    
    // Update the marker element
    marker.textContent = inlineCitation;
    marker.classList.add('citation-marker-processed');
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Process citations with a small delay to ensure DOM is ready
  setTimeout(processCitations, 500);
});

// Also process when window is fully loaded
window.addEventListener('load', processCitations);
