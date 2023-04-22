import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import Header from "@/components/Header";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });
import { sanityClient, urlFor } from "../sanity";
import { Post } from "../typings";
interface Props {
  posts: [Post];
}

export default function Home({ posts }: Props) {
  // console.log(posts);
  return (
    <>
      <div className=" max-w-7xl mx-auto">
        <Head>
          <title>Abdullah Blog</title>
        </Head>
        <Header />
        <div className="flex justify-between  items-center bg-yellow-400 border-y border-black py-10 lg:py-0">
          <div className="px-10 space-y-5">
            <h1 className="text-6xl max-w-xl font-serif">
              <span className=" underline decoration-black decoration-4">
                Muhammad Abdullah
              </span>{" "}
              simple next js Blog Project using Taiwind CSS & sanity
            </h1>
            <h2>
              Hi Iam Muhammd Abdullah a full stack MERN developer This is a blog
              website having comment section and other suff
            </h2>
          </div>
          <img
            className="hidden md:inline-flex h-32 lg:h-full"
            src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
            alt=""
          />
        </div>
        {/* Posts */}
        <div className=" grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-2 md:gap-6 md:p-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/posts/${post.slug.current}`}>
              <div className=" border  rounded-lg group  cursor-pointer overflow-hidden">
                <img className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200  ease-in-out" src={urlFor(post.mainImage).url()!} alt="" />
                <div className=" flex p-5 justify-between bg-white">
                  <div>
                    <p className=" text-lg font-bold">{post.title}</p>
                    <p className=" text-xs">{post.description} created by {post.author.name}</p>
                  </div>
                  <img className=" h-12 w-12 m-2 rounded-full" src={urlFor(post.author.image).url()!} alt="" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async () => {
  const query = `*[_type=="post"]{
    _id,
      title,
    author->{
      name,
      image
    },
      description,
      mainImage,
      slug
  }`;
  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
  };
};
