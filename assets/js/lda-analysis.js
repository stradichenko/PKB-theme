/**
 * LDA Analysis Module
 * Performs topic modeling using TensorFlow.js
 */

// Main LDA Module - Self-executing function to avoid global namespace pollution
(function() {
  // Module configuration
  const CONFIG = {
    NUM_TOPICS: 8, // Increased from 5 to 10
    NUM_WORDS_PER_TOPIC: 10,
    NUM_ITERATIONS: 100, // Increased iterations for better convergence
    MIN_WORD_LENGTH: 2,
    VOCAB_MAX_SIZE: 800, // Increased vocabulary size for more diversity
    MIN_WORD_FREQ: 0.0005, // Lowered minimum frequency
    MAX_WORD_FREQ: 0.2 // Increased maximum frequency
  };

  // Cache DOM elements
  let ldaContainer, topicList, chartBars, tooltip;

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements on load
    ldaContainer = document.getElementById('lda-chart');
    topicList = document.getElementById('topic-list');
    chartBars = document.getElementById('lda-chart-bars');
    tooltip = document.getElementById('topic-tooltip');
    
    if (ldaContainer) {
      initLDA();
    } else {
      console.log('LDA container not found, skipping LDA analysis');
    }
  });

  /**
   * Initialize LDA analysis
   */
  async function initLDA() {
    try {
      // Wait for TensorFlow.js to load
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js not loaded');
      }

      if (typeof tf.ready !== 'function') {
        throw new Error(
          'TensorFlow.js failed to initialize (tf.ready is not available). ' +
          'This is typically caused by a Content Security Policy blocking eval. ' +
          'Ensure script-src includes \'unsafe-eval\' for TensorFlow.js.'
        );
      }

      await tf.ready();
      console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Extract content from embedded data
      const documents = DataManager.getLDADocuments();
      
      if (documents.length === 0) {
        throw new Error('No documents found for analysis');
      }

      // Preprocess documents
      const { docWordMatrix, vocabulary } = TextProcessor.preprocessDocuments(
        documents.map(d => d.content), 
        CONFIG
      );
      
      if (vocabulary.length === 0) {
        throw new Error('No vocabulary extracted from documents');
      }
      
      // Convert to tensor with proper shape
      const docWordTensor = tf.tensor2d(docWordMatrix);
      
      // Run LDA
      const { topicWordDist, docTopicDist } = await LDAModel.runLDA(
        docWordTensor,
        CONFIG.NUM_TOPICS,
        CONFIG.NUM_ITERATIONS
      );

      // Get raw arrays for processing
      const topicWordArray = topicWordDist.arraySync();
      const docTopicArray = docTopicDist.arraySync();

      // Extract top words for each topic
      const topicWords = TextProcessor.extractTopicWords(
        topicWordArray, 
        vocabulary, 
        CONFIG.NUM_WORDS_PER_TOPIC
      );
      
      // Generate topic titles based on top words
      const topicTitles = topicWords.map(topic => TextProcessor.generateTopicTitle(topic));

      // Match documents to their most probable topics (more efficiently)
      const docTopics = [];
      const primaryTopicCounts = new Array(CONFIG.NUM_TOPICS).fill(0);
      
      docTopicArray.forEach((dist, idx) => {
        const topTopicIdx = dist.indexOf(Math.max(...dist));
        primaryTopicCounts[topTopicIdx]++;
        
        docTopics.push({
          title: documents[idx].title,
          type: documents[idx].type,
          url: documents[idx].url || '',
          topicIndex: topTopicIdx,
          probability: dist[topTopicIdx]
        });
      });

      // Calculate topic distributions with optimized approach
      const processedTopicData = processTopicDistribution(
        docTopicArray, 
        topicWords, 
        topicTitles, 
        primaryTopicCounts
      );

      // Update UI with consolidated data - use original indices for document mapping
      UIManager.updateTopicList(processedTopicData, docTopics);
      UIManager.createTopicDistributionChart(processedTopicData);

      console.log('LDA analysis completed successfully');

    } catch (error) {
      console.error('LDA Analysis failed:', error);
      UIManager.showError(error.message);
    }
  }

  /**
   * UI Manager Module
   */
  const UIManager = {
    /**
     * Update the topic list UI
     * @param {Array} processedTopicData - Pre-calculated and sorted topic data
     * @param {Array} docTopics - Document assignments to topics (using original indices)
     */
    updateTopicList: function(processedTopicData, docTopics) {
      if (!topicList) return;
      
      topicList.innerHTML = processedTopicData.map((topicData) => {
        // Use the original topic index (originalIndex) to filter documents correctly
        const docsInTopic = docTopics.filter(d => d.topicIndex === topicData.originalIndex)
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 3);

        return `
          <div class="topic-item">
            <div class="topic-title">
              <span class="topic-number">Topic ${topicData.topicId}</span>
              <span class="topic-pseudo-title">"${topicData.label}"</span>
            </div>
            <div class="topic-content">
              <div class="topic-words">
                <table class="topic-word-table">
                  <thead>
                    <tr>
                      <th>Term</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topicData.topWords ? topicData.topWords.map(({word, weight}) => `
                      <tr>
                        <td><span class="topic-word">${word}</span></td>
                        <td><span class="topic-weight">${weight.toFixed(4)}</span></td>
                      </tr>
                    `).join('') : ''}
                  </tbody>
                </table>
              </div>
              ${docsInTopic.length > 0 ? `
                <div class="topic-documents">
                  <h4>Related Content:</h4>
                  <ul>
                    ${docsInTopic.map(doc => `
                      <li>
                        <span class="doc-type ${doc.type}">${doc.type}</span>
                        <a href="${doc.url || '#'}" class="doc-link">${doc.title}</a>
                        <small>(${(doc.probability * 100).toFixed(1)}%)</small>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              <div class="topic-stats">
                <small>
                  Distribution: ${topicData.percentage}% • 
                  Primary documents: ${topicData.docCount} • 
                  Confidence: ${topicData.confidence}%
                </small>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },
    
    /**
     * Create a topic distribution chart
     */
    createTopicDistributionChart: function(processedTopicData) {
      if (!ldaContainer || !chartBars) return;

      // Clear chart bars container
      chartBars.innerHTML = '';

      // Add bars to the chart - with more efficient event handling
      processedTopicData.forEach((topic) => {
        const barContainer = document.createElement('div');
        barContainer.className = 'topic-bar-container';
        barContainer.dataset.topicId = topic.topicId;
        
        const bar = document.createElement('div');
        bar.className = 'topic-bar';
        bar.style.width = `${Math.max(topic.percentage, 2)}%`;
        
        const label = document.createElement('span');
        label.className = 'topic-bar-label';
        label.textContent = `Topic ${topic.topicId}: ${topic.label}`;
        
        const value = document.createElement('span');
        value.className = 'topic-bar-value';
        value.textContent = `${topic.percentage}%`;
        
        bar.appendChild(label);
        bar.appendChild(value);
        barContainer.appendChild(bar);
        
        // Use topic's pre-calculated confidence value for tooltip
        barContainer.addEventListener('mouseenter', (e) => {
          if (window.showTopicTooltip) {
            window.showTopicTooltip(e, {
              id: topic.topicId,
              label: topic.label,
              keywords: topic.keywords || [],
              documentCount: topic.docCount,
              percentage: topic.percentage,
              confidence: topic.confidence
            });
          }
        });
        
        barContainer.addEventListener('mouseleave', () => {
          if (window.hideTopicTooltip) {
            window.hideTopicTooltip();
          }
        });
        
        chartBars.appendChild(barContainer);
      });
    },
    
    /**
     * Show error message
     */
    showError: function(message) {
      if (!topicList) return;
      
      topicList.innerHTML = `
        <div class="lda-error">
          <p>Failed to perform LDA analysis: ${message}</p>
          <p>This feature requires modern browser support and may not work on all devices.</p>
        </div>
      `;
    }
  };

  /**
   * Process topic distribution data - fixed document counting
   */
  function processTopicDistribution(docTopicDist, topicWords, topicTitles, primaryTopicCounts) {
    const numTopics = docTopicDist[0].length;
    const docCount = docTopicDist.length;
    const topicSums = new Array(numTopics).fill(0);
    
    // Calculate sum for each topic across all documents in one pass
    docTopicDist.forEach(docDist => {
      docDist.forEach((prob, topicIdx) => {
        topicSums[topicIdx] += prob;
      });
    });
    
    // Calculate total sum once
    const totalSum = topicSums.reduce((sum, val) => sum + val, 0);
    const avgProbTotal = totalSum / docCount;
    
    // Create normalized topic distribution with pre-calculated values
    const topicData = topicSums.map((sum, topicIdx) => {
      const avgProb = sum / docCount;
      const percentage = totalSum > 0 ? Math.round((sum / totalSum) * 100) : 0;
      
      return {
        topicId: topicIdx + 1,
        originalIndex: topicIdx, // Keep track of original index for document mapping
        topic: `Topic ${topicIdx + 1}`,
        label: topicTitles?.[topicIdx] || `Topic ${topicIdx + 1}`,
        keywords: topicWords?.[topicIdx]?.map(word => word.word).slice(0, 5) || [],
        // Include the full topic words with weights for the table
        topWords: topicWords?.[topicIdx] || [],
        avgProb: avgProb,
        percentage: percentage,
        // Use the correct primary topic count from the original index
        docCount: primaryTopicCounts[topicIdx],
        // Pre-calculate confidence to avoid redundant calculations later
        confidence: Math.round((avgProb / avgProbTotal) * 100)
      };
    });

    // Sort topics by their overall distribution percentage
    const sortedTopicData = topicData.sort((a, b) => b.percentage - a.percentage);
    
    // Debug logging to verify topic distribution and document counts
    console.log('Topic distribution after sorting:');
    sortedTopicData.forEach((topic, idx) => {
      console.log(`Sorted position ${idx}: Original Topic ${topic.topicId} (index ${topic.originalIndex}), ${topic.percentage}%, ${topic.docCount} primary docs`);
    });
    
    // Verify total document count matches
    const totalDocCount = sortedTopicData.reduce((sum, topic) => sum + topic.docCount, 0);
    console.log(`Total primary document assignments: ${totalDocCount} (should equal ${docCount})`);
    
    return sortedTopicData;
  }

  /**
   * Data Manager Module
   */
  const DataManager = {
    /**
     * Get documents for LDA analysis
     */
    getLDADocuments: function() {
      // Try to get documents from embedded data first
      const dataElement = document.getElementById('lda-documents-data');
      if (dataElement) {
        try {
          return JSON.parse(dataElement.textContent);
        } catch (e) {
          console.warn('Failed to parse embedded LDA documents data');
        }
      }
      
      // Fallback to extracting from page content
      return this.extractDocumentsFromPage();
    },
    
    /**
     * Fallback method to extract content from the current page
     */
    extractDocumentsFromPage: function() {
      const documents = [];
      
      // Extract content from different sections
      const contentSections = document.querySelectorAll('.post-content, .about-section, article');
      contentSections.forEach((section, index) => {
        const text = section.textContent || section.innerText;
        if (text && text.trim().length > 100) {
          documents.push({
            content: text.trim(),
            type: 'content',
            title: `Section ${index + 1}`
          });
        }
      });
      
      return documents;
    }
  };

  /**
   * Text Processing Module
   */
  const TextProcessor = {
    // Common English stop words
    stopWords: new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'of', 'as', 'if', 'when', 'where', 'why', 'how', 'what',
      'who', 'which', 'whose', 'whom', 'it', 'its', 'he', 'she', 'him', 'her',
      'his', 'hers', 'they', 'them', 'their', 'theirs', 'we', 'us', 'our',
      'ours', 'you', 'your', 'yours', 'i', 'me', 'my', 'mine', 'also', 'just',
      'only', 'other', 'such', 'than', 'too', 'very', 'more', 'most', 'much',
      'many', 'some', 'any', 'each', 'every', 'all', 'both', 'either', 'neither',
      'one', 'two', 'first', 'second', 'last', 'next', 'new', 'old', 'same',
      'different', 'good', 'bad', 'big', 'small', 'long', 'short', 'high', 'low'
    ]),
    
    // Cache for tokenized documents
    tokenizedCache: new Map(),
    
    /**
     * Preprocess documents for LDA analysis
     */
    preprocessDocuments: function(documents, config) {
      // Clear token cache
      this.tokenizedCache.clear();
      
      // Create vocabulary
      const vocabMap = new Map();
      const wordCounts = new Map();
      const docFrequency = new Map(); // Track document frequency for better filtering
      
      // First pass: build vocabulary with cached tokenization
      documents.forEach((doc, idx) => {
        const words = this.tokenizeDocument(doc);
        // Cache the tokenized result for later reuse
        this.tokenizedCache.set(idx, words);
        
        const uniqueWords = new Set(words); // Count document frequency, not word frequency
        
        words.forEach(word => {
          if (!vocabMap.has(word)) {
            vocabMap.set(word, vocabMap.size);
          }
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        });
        
        uniqueWords.forEach(word => {
          docFrequency.set(word, (docFrequency.get(word) || 0) + 1);
        });
      });

      // Enhanced vocabulary filtering using both term frequency and document frequency
      const totalWords = Array.from(wordCounts.values()).reduce((a, b) => a + b, 0);
      const numDocs = documents.length;
      
      const sortedWords = Array.from(wordCounts.entries())
        .filter(([word, count]) => {
          const termFreq = count / totalWords;
          const docFreq = docFrequency.get(word) / numDocs;
          
          // Use TF-IDF-like filtering: not too common, not too rare
          return termFreq > config.MIN_WORD_FREQ && 
                 termFreq < config.MAX_WORD_FREQ && 
                 docFreq > 0.02 && // Word appears in at least 2% of documents
                 docFreq < 0.8 &&  // Word appears in less than 80% of documents
                 count >= 3;       // Word appears at least 3 times total
        })
        .sort((a, b) => {
          // Sort by TF-IDF score approximation for better word selection
          const tfIdfA = (a[1] / totalWords) * Math.log(numDocs / docFrequency.get(a[0]));
          const tfIdfB = (b[1] / totalWords) * Math.log(numDocs / docFrequency.get(b[0]));
          return tfIdfB - tfIdfA;
        })
        .slice(0, config.VOCAB_MAX_SIZE)
        .map(([word]) => word);

      const vocabulary = sortedWords;
      const vocabSize = vocabulary.length;
      
      console.log(`Enhanced vocabulary: ${vocabSize} words, ${documents.length} documents`);
      
      // Create document-word matrix using cached tokenized documents
      const docWordMatrix = documents.map((doc, idx) => {
        const counts = new Array(vocabSize).fill(0);
        // Use cached tokenized words
        const words = this.tokenizedCache.get(idx);
          
        words.forEach(word => {
          const idx = vocabulary.indexOf(word);
          if (idx !== -1) {
            counts[idx]++;
          }
        });
        
        // Normalize counts
        const total = counts.reduce((a, b) => a + b, 0);
        if (total > 0) {
          for (let i = 0; i < counts.length; i++) {
            counts[i] = counts[i] / total;
          }
        }
        
        return counts;
      });

      return { docWordMatrix, vocabulary };
    },
    
    /**
     * Tokenize a document into words
     */
    tokenizeDocument: function(text) {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !this.stopWords.has(w) && !/^\d+$/.test(w));
    },
    
    /**
     * Extract top words for each topic
     */
    extractTopicWords: function(topicWordDist, vocabulary, numWords) {
      return topicWordDist.map((topic, topicIdx) => {
        const wordScores = vocabulary.map((word, idx) => ({
          word: word,
          weight: topic[idx]
        }));
        
        const sortedWords = wordScores
          .sort((a, b) => b.weight - a.weight)
          .slice(0, numWords);
        
        console.log(`Topic ${topicIdx}: ${sortedWords.map(w => w.word).join(', ')}`);
        
        return sortedWords;
      });
    },
    
    /**
     * Generate a title for a topic based on top words
     */
    generateTopicTitle: function(topic) {
      const topWords = topic
        .slice(0, 3)
        .map(t => t.word)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
      
      if (topWords.length >= 2) {
        return `${topWords[0]} & ${topWords[1]}`;
      }
      
      return topWords[0] || "Unnamed Topic";
    }
  };

  /**
   * LDA Model Module
   */
  const LDAModel = {
    /**
     * Run LDA algorithm with improved convergence
     */
    runLDA: async function(docWordTensor, numTopics, numIterations) {
      return tf.tidy(() => {
        const [numDocs, vocabSize] = docWordTensor.shape;
        
        console.log(`Running LDA with ${numDocs} docs, ${vocabSize} vocab, ${numTopics} topics`);
        
        // Improved Dirichlet initialization with better separation
        const alpha = 0.5; // Increased document-topic concentration for more focused topics
        const beta = 0.1;   // Increased topic-word concentration for more distinct word distributions
        
        // Initialize with more diverse random distributions
        let docTopicDist = tf.randomUniform([numDocs, numTopics], 0.1, 1.0).add(alpha);
        let topicWordDist = tf.randomUniform([numTopics, vocabSize], 0.01, 0.1).add(beta);
        
        // Add noise to break symmetry and encourage topic diversity
        const topicNoise = tf.randomNormal([numTopics, vocabSize], 0, 0.01);
        topicWordDist = topicWordDist.add(topicNoise);
        
        // Normalize initial distributions
        docTopicDist = docTopicDist.div(docTopicDist.sum(1, true));
        topicWordDist = topicWordDist.div(topicWordDist.sum(1, true));
        
        // Improved iterative refinement with momentum
        let prevTopicWordDist = topicWordDist.clone();
        const momentum = 0.1;
        
        for (let iter = 0; iter < numIterations; iter++) {
          // E-step: Update document-topic distributions with smoothing
          const topicWordTranspose = topicWordDist.transpose();
          const docTopicUpdate = tf.matMul(docWordTensor, topicWordTranspose).add(alpha);
          const newDocTopicDist = docTopicUpdate.div(docTopicUpdate.sum(1, true));
          
          // M-step: Update topic-word distributions with momentum
          const docTopicTranspose = newDocTopicDist.transpose();
          const topicWordUpdate = tf.matMul(docTopicTranspose, docWordTensor).add(beta);
          const normalizedTopicWord = topicWordUpdate.div(topicWordUpdate.sum(1, true));
          
          // Apply momentum to prevent getting stuck in local minima
          const momentumTerm = prevTopicWordDist.sub(topicWordDist).mul(momentum);
          const newTopicWordDist = normalizedTopicWord.add(momentumTerm);
          
          // Update distributions
          docTopicDist = newDocTopicDist;
          prevTopicWordDist = topicWordDist.clone();
          topicWordDist = newTopicWordDist.div(newTopicWordDist.sum(1, true));
          
          // Add small amount of noise every few iterations to maintain diversity
          if (iter % 20 === 0 && iter > 0) {
            const diversityNoise = tf.randomNormal([numTopics, vocabSize], 0, 0.001);
            topicWordDist = topicWordDist.add(diversityNoise);
            topicWordDist = topicWordDist.div(topicWordDist.sum(1, true));
          }
          
          if (iter % 10 === 0) {
            console.log(`LDA iteration ${iter}/${numIterations}`);
          }
        }
        
        // Clean up temporary tensors
        prevTopicWordDist.dispose();
        
        return {
          topicWordDist: topicWordDist,
          docTopicDist: docTopicDist
        };
      });
    }
  };
})();
