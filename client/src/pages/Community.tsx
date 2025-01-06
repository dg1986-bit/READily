import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

type Post = {
  id: number;
  content: string;
  userId: number;
  username: string;
  createdAt: string;
};

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setContent("");
      toast({
        title: "Success",
        description: "Your post has been shared",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community</h1>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={() => createPost.mutate(content)}
          disabled={createPost.isPending || !content.trim()}
        >
          Post
        </Button>
      </div>

      <div className="space-y-4">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-white rounded-lg border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{post.username}</span>
              <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
