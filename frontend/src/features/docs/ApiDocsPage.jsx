import { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Card, Button, Spinner } from '@/components/ui';
import { ExclamationTriangleIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import PageTransition from '@/components/animations/PageTransition';
import apiClient from '@/api/client';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/docs', {
        headers: {
          'Accept': 'text/yaml, application/yaml, application/json',
        },
        responseType: 'text',
      });

      // Parse YAML to check if it's valid
      if (response.data) {
        setSpec(response.data);
      } else {
        throw new Error('Empty response received');
      }
    } catch (err) {
      console.error('Failed to fetch API docs:', err);
      
      if (err.response?.status === 404) {
        setError({
          title: 'Documentation Not Found',
          message: 'The API documentation file could not be found on the server.',
          code: 404,
        });
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        setError({
          title: 'Access Not Allowed',
          message: 'You do not have permission to access the API documentation.',
          code: err.response?.status,
        });
      } else if (err.response?.status === 500) {
        setError({
          title: 'Server Error',
          message: 'The server encountered an error while loading the documentation.',
          code: 500,
        });
      } else if (!err.response) {
        setError({
          title: 'Connection Failed',
          message: 'Could not connect to the API server. Please ensure the backend is running.',
          code: null,
        });
      } else {
        setError({
          title: 'Failed to Load Documentation',
          message: err.message || 'An unexpected error occurred.',
          code: err.response?.status,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  if (loading) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading API Documentation...</p>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <Card className="w-full max-w-lg p-8 text-center dark:bg-slate-900 dark:border-slate-800">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {error.title}
          </h1>
          {error.code && (
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Error {error.code}
            </span>
          )}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={fetchDocs}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = 'https://concierge.ddns.net/'}>
              Go to Home
            </Button>
          </div>
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
            Note: API documentation is only available in the local development environment.
          </p>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-800 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold">Hotel Service API</h1>
              <p className="text-sm text-slate-400">OpenAPI Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={fetchDocs}
              className="!bg-slate-700 !text-white hover:!bg-slate-600 !border-slate-600"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => window.location.href = 'https://concierge.ddns.net/'}
              className="!bg-slate-700 !text-white hover:!bg-slate-600 !border-slate-600"
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      {/* Swagger UI Container */}
      <div className="swagger-ui-container">
        <SwaggerUI 
          spec={spec} 
          docExpansion="list"
          defaultModelsExpandDepth={-1}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
        />
      </div>

      {/* Custom Styles for Swagger UI */}
      <style>{`
        .swagger-ui-container {
          padding: 0;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          font-size: 2rem;
          font-weight: 700;
        }
        
        .swagger-ui .scheme-container {
          background: #f8fafc;
          padding: 15px 20px;
          box-shadow: none;
        }
        
        .dark .swagger-ui-container .swagger-ui {
          background: #0f172a;
        }
        
        .dark .swagger-ui .info .title,
        .dark .swagger-ui .info p,
        .dark .swagger-ui .info .base-url,
        .dark .swagger-ui .opblock-tag,
        .dark .swagger-ui .opblock .opblock-summary-operation-id,
        .dark .swagger-ui .opblock .opblock-summary-path,
        .dark .swagger-ui .opblock .opblock-summary-description,
        .dark .swagger-ui .tab li,
        .dark .swagger-ui table thead tr th,
        .dark .swagger-ui table thead tr td,
        .dark .swagger-ui .parameter__name,
        .dark .swagger-ui .parameter__type,
        .dark .swagger-ui .response-col_status,
        .dark .swagger-ui .response-col_description,
        .dark .swagger-ui label,
        .dark .swagger-ui .model-title,
        .dark .swagger-ui .model {
          color: #e2e8f0 !important;
        }
        
        .dark .swagger-ui .scheme-container {
          background: #1e293b;
        }
        
        .dark .swagger-ui .scheme-container .schemes > label {
          color: #94a3b8;
        }
        
        .dark .swagger-ui .opblock-tag {
          border-bottom-color: #334155;
        }
        
        .dark .swagger-ui section.models {
          border-color: #334155;
        }
        
        .dark .swagger-ui section.models .model-container {
          background: #1e293b;
        }
        
        .dark .swagger-ui .model-box {
          background: #1e293b;
        }
        
        .dark .swagger-ui .opblock.opblock-get {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .dark .swagger-ui .opblock.opblock-post {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .dark .swagger-ui .opblock.opblock-put,
        .dark .swagger-ui .opblock.opblock-patch {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
        }
        
        .dark .swagger-ui .opblock.opblock-delete {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .dark .swagger-ui .opblock .opblock-section-header {
          background: #1e293b;
        }
        
        .dark .swagger-ui .opblock-body pre.microlight {
          background: #0f172a !important;
        }
        
        .dark .swagger-ui .responses-inner {
          background: #1e293b;
        }
        
        .dark .swagger-ui input[type=text],
        .dark .swagger-ui textarea {
          background: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }
        
        .dark .swagger-ui select {
          background: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }

        .swagger-ui .btn {
          border-radius: 6px;
        }
        
        .swagger-ui .btn.execute {
          background-color: #10b981;
          border-color: #10b981;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #059669;
        }

        .swagger-ui .filter-container .filter input[type=text] {
          border-radius: 8px;
          padding: 8px 12px;
        }

        .dark .swagger-ui .filter-container .filter input[type=text] {
          background: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
        }
      `}</style>
    </PageTransition>
  );
}
