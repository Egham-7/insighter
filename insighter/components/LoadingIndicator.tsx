const LoadingIndicator = () => (
  <div className="mt-2 flex gap-1">
    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75">
      &nbsp;
    </span>
    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75 delay-150">
      &nbsp;
    </span>
    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary opacity-75 delay-300">
      &nbsp;
    </span>
  </div>
);

export default LoadingIndicator;
