export function StatsBar() {
  const stats = [
    { value: '500+', label: 'Successful Treks' },
    { value: '50+', label: 'Expert Guides' },
    { value: '30+', label: 'Countries Served' },
    { value: '15+', label: 'Years Experience' },
    { value: '4.9★', label: 'Average Rating' },
  ]

  return (
    <div className="bg-primary text-primary-foreground py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-serif text-3xl font-bold text-accent">{stat.value}</span>
              <span className="text-xs font-medium text-primary-foreground/70 mt-1 uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
