import { useUser } from "@/hooks/use-user";
import AgeGroupSelector from "@/components/AgeGroupSelector";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to READily</h1>
        <p className="text-xl text-gray-600">A world of children's stories, delivered to your door</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1537185055792-a54585f4ff2f"
            alt="Baby enjoying a colorful book"
            className="w-full h-[300px] object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Find the Perfect Books</h2>
          <p className="text-gray-600">
            Discover age-appropriate books that will spark your child's imagination and foster their love for reading.
          </p>
          <AgeGroupSelector />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">Age-Appropriate Personalized Recommendations</h3>
          <p className="text-gray-600">Curated picks for every stage to guide new moms in nurturing their baby's brain development</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">Moms Together</h3>
          <p className="text-gray-600">A space for moms to unite, share helpful recommendations, and support each other in their child's growth</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">Easy Borrowing</h3>
          <p className="text-gray-600">Seamless integration of library collections, due date notifications, and book delivery</p>
        </div>
      </section>
    </div>
  );
}