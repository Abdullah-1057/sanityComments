import { sanityClient, urlFor } from "@/sanity";
import Header from "@/components/Header";
import React, { useState } from "react";
import { Post } from "@/typings";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

function Post({ post }: Props) {
  const [submitted, setSubmitted] = useState(false);
  // console.log(post);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        // console.log(data);
        setSubmitted(true);
      })
      .catch((error) => {
        console.log(error);
        setSubmitted(false);
      });
  };
  return (
    <main>
      <Header />
      <img
        className="h-60 w-full object-cover "
        src={urlFor(post.mainImage).url()!}
        alt=""
      />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="test-xl font-light mb-2 text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className=" h-12 w-12 m-2 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className=" font-extralight text-sm">
            Blog is Posted by:{" "}
            <span className=" text-green-600 "> {post.author.name}</span>{" "}
            published on - {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-7">
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-8">{...props}</h1>
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-bold my-8">{...props}</h2>
              ),

              li: ({ children }: any) => (
                <li className="ml-4  list-disc ">{children}</li>
              ),

              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-400 text-white max-w-2xl mx-auto">
          <h3 className=" text-3xl font-bold">
            {" "}
            Thank you for submitting the comment
          </h3>
          <p>Once it is submitted it will be shown below</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
          action=""
        >
          <h3 className="text-sm text-yellow-500">Enjoy this article</h3>
          <h4 className="text-3xl font-bold">Leave a comment below</h4>
          <hr className="py-2 mt-2" />
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="block mb-5">
            <span>Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500  outline-none focus:ring"
              type="text"
              name="name"
              id=""
              placeholder="Muhammad Abdullah"
            />
          </label>
          <label className="block mb-5">
            <span>Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500  outline-none focus:ring"
              type="email"
              name="email"
              id=""
              placeholder="Muhammad Abdullah"
            />
          </label>
          <label className="block mb-5">
            <span>Description</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500
        outline-none focus:ring"
              name="comment"
              id=""
              placeholder="comments"
              rows={8}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500 ">
                - The name field is required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500 ">
                - The email field is required
              </span>
            )}
            {errors.comment && (
              <span className="text-red-500 ">- comment field is required</span>
            )}
          </div>
          <input
            className="shadow bg-yellow-300 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
            type="submit"
          />
        </form>
      )}
      {/* comments */}
      <div className=" flex flex-col p-10 mx-auto my-10 max-w-2xl shadow-yellow-500 shadow space-y-2">
        <h3 className=" text-4xl text-bold pb-2">Comments</h3>
        <hr className=" pb-2" />
        {
          post.comments.map((comment)=>(
            <div>
              <p><span className=" text-yellow-500 ">{comment.name}</span> : {comment.comment}</p>
            </div>
          ))
        }
      </div>
    </main>
  );
}

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type=="post"]{
    _id,
      slug{
      current
      },
  }`;
  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=="post" && slug.current == $slug][0]{
        _id,
          _createdAt,
          title,
        author->{
          name,
          image
        },
        'comments':*[
            _type=="comment" && post._ref == ^._id && approved == true
        ],
          description,
          mainImage,
          slug,
          body
      }`;
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  if (!post) {
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        post,
      },
      revalidate: 60,
    };
  }
};
