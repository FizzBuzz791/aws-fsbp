import { BucketEncryption } from "@aws-cdk/aws-s3";
import { App, Stack, Aspects } from "@aws-cdk/core";
import { AWSFoundationalSecurityBestPracticesChecker } from "../../src/aws-foundational-security-best-practices";
import { S3Builder } from "./S3Builder";

describe("S3", () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe("[S3.4] S3 buckets should have server-side encryption enabled", () => {
    test("Given an S3 Bucket with server-side encryption disabled, When synth is run, Then synth should fail", () => {
      // Arrange
      const stack = new Stack(app, "test-s3-4-stack-fail", {});
      new S3Builder(stack).withEncryption(BucketEncryption.UNENCRYPTED).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-s3-4-stack-fail").messages;

      // Assert
      expect(synthMessages.length).toBe(1);
      expect(synthMessages[0].level).toBe("error");
      expect(synthMessages[0].entry.data).toBe(
        "[S3.4] S3 buckets should have server-side encryption enabled"
      );
    });

    test("Given an S3 Bucket with server-side encryption enabled, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-s3-4-stack-pass", {});
      new S3Builder(stack).withEncryption(BucketEncryption.KMS_MANAGED).build();
      Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-s3-4-stack-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });

    test("Given an S3 Bucket with server-side encryption disabled and S3.4 is ignored, When synth is run, Then synth should pass", () => {
      // Arrange
      const stack = new Stack(app, "test-s3-4-stack-ignore-pass", {});
      new S3Builder(stack).withEncryption(BucketEncryption.UNENCRYPTED).build();
      Aspects.of(app).add(
        new AWSFoundationalSecurityBestPracticesChecker({
          s3: { serverSideEncryption: false },
        })
      );

      // Act
      const synthMessages = app
        .synth({ validateOnSynthesis: true, force: true })
        .getStackByName("test-s3-4-stack-ignore-pass").messages;

      // Assert
      expect(synthMessages.length).toBe(0);
    });
  });

  // describe("[S3.5] S3 buckets should require requests to use Secure Socket Layer", () => {
  //   test("Given an S3 Bucket that doesn't require SSL, When synth is run, Then synth should fail", () => {
  //     // Arrange
  //     const stack = new Stack(app, "test-s3-5-stack-fail", {});
  //     new S3Builder(stack).build();
  //     Aspects.of(app).add(new AWSFoundationalSecurityBestPracticesChecker());

  //     // Act
  //     const synthApp = app
  //       .synth({ validateOnSynthesis: true, force: true })
  //       .getStackByName("test-s3-5-stack-fail");
  //     console.log(JSON.stringify(synthApp.template));
  //     const synthMessages = synthApp.messages;

  //     // Assert
  //     expect(synthMessages.length).toBe(1);
  //     expect(synthMessages[0].level).toBe("error");
  //     expect(synthMessages[0].entry.data).toBe(
  //       "[S3.5] S3 buckets should require requests to use Secure Socket Layer"
  //     );
  //   });
  // });
});
