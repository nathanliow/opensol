interface PaginationButtonsProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const PaginationButtons = ({ currentPage, totalPages, setCurrentPage }: PaginationButtonsProps) => {
  // Function to change page
  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of project list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-1 bg-[#1E1E1E] rounded-md shadow-lg p-1">
        <button
          onClick={() => changePage(1)}
          className={`px-3 py-1.5 ${currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
          disabled={currentPage === 1}
        >
          <span className="sr-only">First</span>
          <span aria-hidden="true">&laquo;</span>
        </button>
        
        <button
          onClick={() => changePage(currentPage - 1)}
          className={`px-3 py-1.5 ${currentPage === 1 ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        
        {/* Render page numbers with proper spacing between */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNum = index + 1;
          // Always show first page, last page, current page, and one page before/after current
          const shouldShowPageNumber = 
            pageNum === 1 || 
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
          
          // Only show ellipsis if there's a gap
          const shouldShowEllipsisBefore = pageNum === currentPage - 1 && currentPage > 3;
          const shouldShowEllipsisAfter = pageNum === currentPage + 1 && currentPage < totalPages - 2;
          
          if (shouldShowPageNumber) {
            return (
              <button
                key={pageNum}
                onClick={() => changePage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-white hover:bg-[#2D2D2D]'}`}
              >
                {pageNum}
              </button>
            );
          } else if (shouldShowEllipsisBefore) {
            return <span key={`ellipsis-before-${pageNum}`} className="px-1 text-gray-500">...</span>;
          } else if (shouldShowEllipsisAfter) {
            return <span key={`ellipsis-after-${pageNum}`} className="px-1 text-gray-500">...</span>;
          }
          
          // Don't render this page number
          return null;
        })}
        
        <button
          onClick={() => changePage(currentPage + 1)}
          className={`px-3 py-1.5 ${currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
        
        <button
          onClick={() => changePage(totalPages)}
          className={`px-3 py-1.5 ${currentPage === totalPages ? 'text-gray-500' : 'text-white hover:bg-[#2D2D2D]'} rounded-md`}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Last</span>
          <span aria-hidden="true">&raquo;</span>
        </button>
      </div>
    </div>
  );
};