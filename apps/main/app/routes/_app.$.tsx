import { Link, useParams } from '@remix-run/react';
import { Button } from '@wesp-up/ui';

export default function NotFoundPage() {
    const params = useParams();

    return (
        <div className="flex flex-col justify-center space-y-4 p-8">
            <p className="text-center text-4xl">Oh, snap! This page does not exist!</p>
            <p className="text-center text-gray-400">You visited {params['*']}</p>

            <div className="flex justify-center">
                <Button as={Link} to="/home">
                    Take me home!
                </Button>
            </div>
        </div>
    );
}
