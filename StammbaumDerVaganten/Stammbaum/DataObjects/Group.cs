using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    public enum GroupType
    {
        None,
        Custom,
        Stamm,
        Meute,
        Rudel,
        Gilde,
        Sippe,
        Runde,
        Kreis
    }

    [DataContract]
    public class GroupPhase
    {
        [DataMember(Name = "_T")]
        public VersionedData<GroupType> Type { get; set; } = new VersionedData<GroupType>();
        [DataMember(Name = "_CT")]
        public VersionedData<string> CustomType { get; set; } = new VersionedData<string>(); //If Type set to "Custom"

        [DataMember(Name = "_TSP")]
        public Timespan Timespan { get; set; } = new Timespan();

        public GroupPhase()
        { }

        public GroupPhase(GroupType type, Timespan timespan)
            :this(type, "", timespan)
        {
            Debug.Assert(type != GroupType.Custom);
        }

        public GroupPhase(GroupType type, string customType, Timespan timespan)
        {
            Type.OverwriteLatestValue(type);
            CustomType.OverwriteLatestValue(customType);
            Timespan = timespan;
        }
    }

    [DataContract]
    public class Group : Referenceable<Group>
    {
        [DataMember(Name = "_N")]
        public VersionedData<string> Name { get; set; } = new VersionedData<string>();

        [DataMember(Name = "_MP")]
        public GroupPhase MainPhase { get; set; } = new GroupPhase();
        [DataMember(Name = "_AP")]
        public List<GroupPhase> AdditionalPhases { get; set; } = new List<GroupPhase>();

        [DataMember(Name = "_C")]
        public VersionedData<string> Comment { get; set; } = new VersionedData<string>();

        public Group()
        { }

        public Group(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Group(Database context, bool claimID, string name, GroupPhase mainPhase, List<GroupPhase> additionalPhases, string comment = "")
            : this(context, claimID)
        {
            Name.OverwriteLatestValue(name);
            MainPhase = mainPhase;
            AdditionalPhases = additionalPhases;
            Comment.OverwriteLatestValue(comment);
        }

        public override string ToString()
        {
            return MainPhase.Timespan.Start.Year + " " + MainPhase.Type.Latest.ToString() + " " + Name.Latest + " [" + reference.Latest.ToString() + "]";
        }
    }
}
