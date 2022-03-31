using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Participation<TDerived> : Referenceable<TDerived>
        where TDerived : class
    {
        [DataMember(Name = "_G")]
        public VersionedData<Reference<Group>> GroupRef { get; set; } = new VersionedData<Reference<Group>>();

        [DataMember(Name = "_TSP")]
        public Timespan Timespan { get; set; } = new Timespan();

        public Participation()
        { }

        public Participation(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Participation(Database context, bool claimID, Reference<Group> groupRef, Timespan timespan)
            : this(context, claimID)
        {
            GroupRef.OverwriteLatestValue(groupRef);
            Timespan = timespan;
        }
    }

    [DataContract]
    public class Membership : Participation<Membership>
    {
        public Membership()
        { }

        public Membership(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Membership(Database context, bool claimID, Reference<Group> groupRef, Timespan timespan)
            : base(context, claimID, groupRef, timespan)
        { }

        public override string ToString()
        {
            return "Implement Membership.ToString()";
        }
    }

    [DataContract]
    public class Activity : Participation<Activity>
    {
        [DataMember(Name = "_R")]
        public VersionedData<Reference<Role>> RoleRef { get; set; } = new VersionedData<Reference<Role>>();

        public Activity()
        { }

        public Activity(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Activity(Database context, bool claimID, Reference<Group> groupRef, Reference<Role> roleRef, Timespan timespan)
            : base(context, claimID, groupRef, timespan)
        {
            RoleRef.OverwriteLatestValue(roleRef);
        }

        public override string ToString()
        {
            return "Implement Activity.ToString()";
        }
    }

}
