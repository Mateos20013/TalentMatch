using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InternalTalentManagement.Models;

namespace InternalTalentManagement.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Objective> Objectives { get; set; }
    public DbSet<ObjectiveProgress> ObjectiveProgresses { get; set; }
    public DbSet<Certificate> Certificates { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<PerformanceReview> PerformanceReviews { get; set; }
    public DbSet<JobOffer> JobOffers { get; set; }
    public DbSet<JobApplication> JobApplications { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Objective relationships
        builder.Entity<Objective>()
            .HasOne(o => o.User)
            .WithMany(u => u.Objectives)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ObjectiveProgress relationships
        builder.Entity<ObjectiveProgress>()
            .HasOne(op => op.Objective)
            .WithMany(o => o.ProgressUpdates)
            .HasForeignKey(op => op.ObjectiveId)
            .OnDelete(DeleteBehavior.Cascade);

        // Certificate relationships
        builder.Entity<Certificate>()
            .HasOne(c => c.User)
            .WithMany(u => u.Certificates)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Achievement relationships
        builder.Entity<Achievement>()
            .HasOne(a => a.User)
            .WithMany(u => u.Achievements)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // PerformanceReview relationships
        builder.Entity<PerformanceReview>()
            .HasOne(pr => pr.Employee)
            .WithMany(u => u.ReviewsReceived)
            .HasForeignKey(pr => pr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PerformanceReview>()
            .HasOne(pr => pr.Reviewer)
            .WithMany(u => u.ReviewsGiven)
            .HasForeignKey(pr => pr.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        // JobOffer relationships
        builder.Entity<JobOffer>()
            .HasOne(jo => jo.CreatedBy)
            .WithMany(u => u.JobOffers)
            .HasForeignKey(jo => jo.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // JobApplication relationships
        builder.Entity<JobApplication>()
            .HasOne(ja => ja.JobOffer)
            .WithMany(jo => jo.Applications)
            .HasForeignKey(ja => ja.JobOfferId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<JobApplication>()
            .HasOne(ja => ja.Applicant)
            .WithMany()
            .HasForeignKey(ja => ja.ApplicantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        builder.Entity<Objective>().HasIndex(o => o.UserId);
        builder.Entity<Certificate>().HasIndex(c => c.UserId);
        builder.Entity<Achievement>().HasIndex(a => a.UserId);
        builder.Entity<PerformanceReview>().HasIndex(pr => pr.EmployeeId);
        builder.Entity<JobApplication>().HasIndex(ja => ja.ApplicantId);
    }
}
