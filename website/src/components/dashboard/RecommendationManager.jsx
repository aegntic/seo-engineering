import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, useFilters, useGlobalFilter, usePagination } from 'react-table';

const RecommendationManager = ({ data = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  
  // Sample data if no data is provided
  const sampleRecommendations = [
    {
      id: 1,
      title: 'Add meta descriptions to product pages',
      category: 'Meta Tags',
      impact: 'high',
      effort: 'low',
      status: 'pending',
      description: 'Add unique and descriptive meta descriptions to all product pages to improve click-through rates from search results.',
      affectedPages: [
        { url: '/products/product-1', title: 'Product 1' },
        { url: '/products/product-2', title: 'Product 2' },
        { url: '/products/product-3', title: 'Product 3' },
      ],
      implementationNotes: 'Each meta description should be unique, between 120-158 characters, and include the main keyword for the page.'
    },
    {
      id: 2,
      title: 'Optimize image sizes on the homepage',
      category: 'Performance',
      impact: 'high',
      effort: 'medium',
      status: 'in-progress',
      description: 'Compress and resize large images on the homepage to improve page load speed and Core Web Vitals scores.',
      affectedPages: [
        { url: '/', title: 'Homepage' },
      ],
      implementationNotes: 'Use WebP format where possible and ensure images are appropriately sized for their display dimensions.'
    },
    {
      id: 3,
      title: 'Fix broken internal links',
      category: 'Links',
      impact: 'medium',
      effort: 'low',
      status: 'completed',
      description: 'Fix 5 broken internal links that are preventing proper site crawling and navigation.',
      affectedPages: [
        { url: '/blog/post-1', title: 'Blog Post 1' },
        { url: '/services', title: 'Services Page' },
      ],
      implementationNotes: 'Update href attributes to point to the correct URLs or remove the links if the target pages no longer exist.'
    },
    {
      id: 4,
      title: 'Implement schema markup for products',
      category: 'Structure',
      impact: 'medium',
      effort: 'medium',
      status: 'pending',
      description: 'Add product schema markup to all product pages to enhance search result appearance and potentially improve click-through rates.',
      affectedPages: [
        { url: '/products', title: 'Products Category' },
        { url: '/products/product-1', title: 'Product 1' },
        { url: '/products/product-2', title: 'Product 2' },
      ],
      implementationNotes: 'Implement JSON-LD product schema including price, availability, ratings, and product images.'
    },
    {
      id: 5,
      title: 'Improve content quality on service pages',
      category: 'Content',
      impact: 'high',
      effort: 'high',
      status: 'pending',
      description: 'Enhance the content on service pages to be more comprehensive and better target relevant keywords.',
      affectedPages: [
        { url: '/services/service-1', title: 'Service 1' },
        { url: '/services/service-2', title: 'Service 2' },
      ],
      implementationNotes: 'Expand content to at least 800 words per page, include relevant keywords naturally, and add compelling calls to action.'
    },
    {
      id: 6,
      title: 'Optimize heading structure',
      category: 'Structure',
      impact: 'medium',
      effort: 'low',
      status: 'pending',
      description: 'Correct the heading structure on multiple pages to follow proper H1-H6 hierarchy for better SEO and accessibility.',
      affectedPages: [
        { url: '/about', title: 'About Us' },
        { url: '/blog', title: 'Blog' },
        { url: '/contact', title: 'Contact' },
      ],
      implementationNotes: 'Ensure each page has exactly one H1 and that heading levels are not skipped (e.g., H1 to H3 without H2).'
    },
    {
      id: 7,
      title: 'Add alt text to images',
      category: 'Accessibility',
      impact: 'medium',
      effort: 'low',
      status: 'in-progress',
      description: 'Add descriptive alt text to images across the site to improve accessibility and image SEO.',
      affectedPages: [
        { url: '/', title: 'Homepage' },
        { url: '/products', title: 'Products' },
        { url: '/about', title: 'About Us' },
      ],
      implementationNotes: 'Alt text should be descriptive but concise, and should convey the purpose of the image rather than just describing it.'
    },
    {
      id: 8,
      title: 'Improve mobile responsiveness',
      category: 'Performance',
      impact: 'high',
      effort: 'high',
      status: 'pending',
      description: 'Fix mobile display issues on product pages to improve user experience and mobile SEO rankings.',
      affectedPages: [
        { url: '/products/product-1', title: 'Product 1' },
        { url: '/products/product-2', title: 'Product 2' },
      ],
      implementationNotes: 'Ensure text is readable without zooming, tap targets are appropriately sized, and content doesn\'t overflow the viewport.'
    },
    {
      id: 9,
      title: 'Fix duplicate title tags',
      category: 'Meta Tags',
      impact: 'medium',
      effort: 'low',
      status: 'pending',
      description: 'Create unique title tags for pages currently using duplicate titles.',
      affectedPages: [
        { url: '/blog/post-1', title: 'Blog Post 1' },
        { url: '/blog/post-2', title: 'Blog Post 2' },
      ],
      implementationNotes: 'Each title should be unique, 50-60 characters in length, and include the primary keyword for the page.'
    },
    {
      id: 10,
      title: 'Implement lazy loading for images',
      category: 'Performance',
      impact: 'medium',
      effort: 'medium',
      status: 'completed',
      description: 'Implement lazy loading for images below the fold to improve initial page load times.',
      affectedPages: [
        { url: '/', title: 'Homepage' },
        { url: '/products', title: 'Products' },
        { url: '/blog', title: 'Blog' },
      ],
      implementationNotes: 'Use the loading="lazy" attribute for images or implement a JavaScript lazy loading solution if broader browser support is needed.'
    },
  ];
  
  // Set recommendations data
  useEffect(() => {
    setRecommendations(data || sampleRecommendations);
  }, [data]);
  
  // Define table columns
  const columns = React.useMemo(() => [
    {
      Header: 'Title',
      accessor: 'title',
    },
    {
      Header: 'Category',
      accessor: 'category',
      Filter: SelectColumnFilter,
      filter: 'includes',
    },
    {
      Header: 'Impact',
      accessor: 'impact',
      Filter: SelectColumnFilter,
      filter: 'includes',
      Cell: ({ value }) => {
        let bgColor = '';
        switch (value) {
          case 'high':
            bgColor = 'bg-red-100 text-red-800';
            break;
          case 'medium':
            bgColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'low':
            bgColor = 'bg-green-100 text-green-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {value}
          </span>
        );
      }
    },
    {
      Header: 'Effort',
      accessor: 'effort',
      Filter: SelectColumnFilter,
      filter: 'includes',
      Cell: ({ value }) => {
        let bgColor = '';
        switch (value) {
          case 'high':
            bgColor = 'bg-red-100 text-red-800';
            break;
          case 'medium':
            bgColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'low':
            bgColor = 'bg-green-100 text-green-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {value}
          </span>
        );
      }
    },
    {
      Header: 'Status',
      accessor: 'status',
      Filter: SelectColumnFilter,
      filter: 'includes',
      Cell: ({ value }) => {
        let bgColor = '';
        switch (value) {
          case 'completed':
            bgColor = 'bg-green-100 text-green-800';
            break;
          case 'in-progress':
            bgColor = 'bg-blue-100 text-blue-800';
            break;
          case 'pending':
            bgColor = 'bg-gray-100 text-gray-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {value}
          </span>
        );
      }
    },
    {
      Header: 'Actions',
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedRecommendation(row.original)}
            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            View
          </button>
          <button
            onClick={() => handleStatusChange(row.original.id)}
            className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {row.original.status === 'pending' ? 'Start' : 
             row.original.status === 'in-progress' ? 'Complete' : 'Reopen'}
          </button>
        </div>
      ),
    },
  ], []);
  
  // Handle status change
  const handleStatusChange = (id) => {
    setRecommendations(prevRecs => {
      return prevRecs.map(rec => {
        if (rec.id === id) {
          let newStatus;
          switch (rec.status) {
            case 'pending':
              newStatus = 'in-progress';
              break;
            case 'in-progress':
              newStatus = 'completed';
              break;
            case 'completed':
              newStatus = 'pending';
              break;
            default:
              newStatus = rec.status;
          }
          return { ...rec, status: newStatus };
        }
        return rec;
      });
    });
  };
  
  // Handle recommendation implementation
  const handleImplement = (id) => {
    // This would typically trigger an API call to implement the recommendation
    alert(`Implementation for recommendation ${id} would be triggered here.`);
    // Update the status to in-progress
    handleStatusChange(id);
    // Close the details view
    setSelectedRecommendation(null);
  };
  
  // Create table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: recommendations,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  
  const { globalFilter, pageIndex, pageSize } = state;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">SEO Recommendations</h2>
      </div>
      <div className="p-6">
        <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search recommendations..."
              className="px-4 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[5, 10, 20, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
              Bulk Actions
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                      <div>{column.canFilter ? column.render('Filter') : null}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50">
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`px-4 py-2 border border-gray-300 text-sm rounded-md ${!canPreviousPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`px-4 py-2 border border-gray-300 text-sm rounded-md ${!canNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pageIndex * pageSize + 1}</span> to <span className="font-medium">{Math.min((pageIndex + 1) * pageSize, recommendations.length)}</span> of <span className="font-medium">{recommendations.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                  className={`px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${!canPreviousPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  &laquo;
                </button>
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className={`px-3 py-2 border border-gray-300 text-sm font-medium ${!canPreviousPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  &lsaquo;
                </button>
                {Array.from(Array(pageCount).keys()).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => gotoPage(pageNum)}
                    className={`px-4 py-2 border border-gray-300 text-sm font-medium ${pageNum === pageIndex ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50'}`}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className={`px-3 py-2 border border-gray-300 text-sm font-medium ${!canNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  &rsaquo;
                </button>
                <button
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${!canNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendation Details Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedRecommendation.title}</h3>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${'bg-gray-100 text-gray-800'}`}>
                  {selectedRecommendation.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRecommendation.impact === 'high' ? 'bg-red-100 text-red-800' :
                  selectedRecommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Impact: {selectedRecommendation.impact}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRecommendation.effort === 'high' ? 'bg-red-100 text-red-800' :
                  selectedRecommendation.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Effort: {selectedRecommendation.effort}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRecommendation.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedRecommendation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {selectedRecommendation.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedRecommendation.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Affected Pages</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRecommendation.affectedPages.map((page, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-blue-600 whitespace-nowrap">{page.url}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{page.title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Implementation Notes</h4>
                <p className="text-sm text-gray-600">{selectedRecommendation.implementationNotes}</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                {selectedRecommendation.status !== 'completed' && (
                  <button
                    onClick={() => handleImplement(selectedRecommendation.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                  >
                    {selectedRecommendation.status === 'pending' ? 'Implement' : 'Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for column filters
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate options for filtering
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);
  
  return (
    <select
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default RecommendationManager;